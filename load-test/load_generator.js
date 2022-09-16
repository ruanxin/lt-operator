// import { Kubernetes } from 'k6/x/kubernetes';
import {check, sleep, fail} from 'k6';
import http from 'k6/http';
import exec from 'k6/x/exec';

const VU = 1;
const ITERATION = 1;

export const options = {
    scenarios: {
        create_kyma_crs: {
            exec: 'createKymaCRs',
            executor: 'per-vu-iterations',
            vus: VU,
            iterations: ITERATION,
            gracefulStop: '1m',
        },
        // tracking_alerts: {
        //     exec: 'trackingAlerts',
        //     executor: 'constant-arrival-rate',
        //     duration: '3m',
        //     rate: 1,
        //     timeUnit: '10s',
        //     preAllocatedVUs: 1,
        //     maxVUs: 1,
        //     // startTime: '2m', // run after create_configmap
        // }
    },
    thresholds: {
        'checks{scenario:create_kyma_crs}': ['rate==1'], // no errors
        // 'checks{scenario:tracking_alerts}': ['rate==1'], // no alerts
    },

};
const kyma_loadtest_template = open('./util/lt-kyma.yaml')
const module_template_template = open('./util/lt-module-template-remote.yaml')
const secret_template = open('./util/lt-secret-worker.yaml')

export function createKymaCRs() {
    const index = '2-' + __VU + '-' + __ITER;
    var componentName = 'manifest' + index;
    deployModuleTemplate(componentName)

    const kymaName = 'kyma-' + index
    deploySecret(kymaName)
    let kyma = kyma_loadtest_template.replace(/kyma-replace-me/g, kymaName);
    for (let i = 1; i <= 20; i++) {
        const moduleName = componentName +'-'+ i
        kyma += '    - name: ' + moduleName + '\n'
    }
    const cmd = "echo " + "'" + kyma + "'" + " | kubectl apply -f -"
    const out = exec.command('bash', ['-c', cmd]);
    console.log("creating: ", kymaName);
    check(out, {'kyma created': (out) => out.includes(kymaName)})
    sleep(1);
}

function deployModuleTemplate(componentName) {
    for (let i = 1; i <= 20; i++) {
        const replace =  componentName  + '-'+ i
        const component = module_template_template.replace(/replace-me/g, replace);
        const cmd = "echo " + "'" + component + "'" + " | kubectl apply -f -"
        const out = exec.command('bash', ['-c', cmd]);
        console.log("out: ", out);
        console.log("creating moduletemplate: ", replace);
        check(out, {'component created': (out) => out.includes(replace)})
        sleep(1);
    }
}


function deploySecret(replace) {
        const component = secret_template.replace(/replace-me/g, replace);
        const cmd = "echo " + "'" + component + "'" + " | kubectl apply -f -"
        console.log("cmd: ", cmd);

        const out = exec.command('bash', ['-c', cmd]);
        console.log("creating secret for ", replace);
        console.log("out: ", out);
        check(out, {'component created': (out) => out.includes(replace)})
        sleep(1);

}

export function trackingAlerts() {
    const apiToken = 'eyJrIjoiYTJpUTRSeVJuRTVUc1BDN3Y5SHdLalNLVGs3N3VBdXkiLCJuIjoidGVzdCIsImlkIjoxfQ==';
    const requestHeaders = {
        'User-Agent': 'k6',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiToken,
    };

    const params = {
        headers: requestHeaders,
    };
    const res = http.get('http://localhost:3000/api/alertmanager/grafana/api/v2/alerts', params);
    res.json().forEach( alert => {
        console.log(alert['status']['state'])
        if (alert['status']['state'] === 'active') {
            check(alert, {'alert triggered': false})
        }
    })
}


export function setup() {
}

export function teardown(data) {
    console.log("teardown")
    // deleteKymaCRs();
}

