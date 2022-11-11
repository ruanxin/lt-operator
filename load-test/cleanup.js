import {check, sleep, fail} from 'k6';
import exec from 'k6/x/exec';

const VU = 50;
const ITERATION = 200;

export const options = {
    scenarios: {
        // remove_finalizers: {
        //     exec: 'removeFinalizers',
        //     executor: 'per-vu-iterations',
        //     vus: VU,
        //     iterations: ITERATION,
        //     gracefulStop: '1m',
        //     maxDuration: '100m'
        // },

        delete_manifests: {
            exec: 'deleteManifests',
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
        // 'checks{scenario:delete_module_template_crs}': ['rate==1'], // no errors/
        // 'checks{scenario:tracking_alerts}': ['rate==1'], // no alerts
    },

};
export function removeFinalizers() {
    for(let i = 1; i <= 20; ++i) {
        const index = '--' + __VU + '-' + __ITER + '-manifest-' + i;
        const manifests = 'kyma' + index;
        console.log("deleting: ", manifests)
        const cmd = "kubectl patch manifest -p '{\"metadata\":{\"finalizers\":null}}' --type=merge " + manifests +"  || true"
        try {
            const out = exec.command('bash', ['-c', cmd]);
            console.log("out:", out)
        } catch (e) {
            fail("ignore");
        }
        // sleep(1);
    }
}

export function deleteManifests() {
    for(let i = 1; i <= 20; ++i) {
        const index = '--' + __VU + '-' + __ITER + '-manifest-' + i;
        const manifests = 'kyma' + index;
        console.log("deleting: ", manifests)
        const cmd = "kubectl delete manifest --wait=false " + manifests +"  || true"
        try {
            const out = exec.command('bash', ['-c', cmd]);
            console.log("out:", out)
        } catch (e) {
            fail("ignore");
        }
        // sleep(1);
    }
}