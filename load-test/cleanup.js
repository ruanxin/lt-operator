import {check, sleep, fail} from 'k6';
import exec from 'k6/x/exec';

const VU = 10;
const ITERATION = 100;

export const options = {
    scenarios: {
        delete_module_template_crs: {
            exec: 'deleteMTCRs',
            executor: 'per-vu-iterations',
            vus: VU,
            iterations: ITERATION,
            gracefulStop: '1m',
            maxDuration: '100m'
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
        'checks{scenario:delete_module_template_crs}': ['rate==1'], // no errors/
        // 'checks{scenario:tracking_alerts}': ['rate==1'], // no alerts
    },

};
export function deleteMTCRs() {
    for(let i = 1; i <= 20; ++i) {
        const index = '2-' + __VU + '-' + __ITER + '-' + i;
        const moduleTemplate = 'manifest' + index;
        console.log("deleting: ", moduleTemplate)
        const cmd1 = "kubectl delete --ignore-not-found=true --force moduletemplates " + moduleTemplate
        const out = exec.command('bash', ['-c', cmd1]);
        console.log("out:", out)
        check(outKyma, {"moduletemplate deleted": (out) => out.includes("force deleted")})
        sleep(1);
    }
}