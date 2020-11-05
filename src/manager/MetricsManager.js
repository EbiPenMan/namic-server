import {v4 as uuidv4} from 'uuid';

export default class MetricsManager {
    constructor() {
        this.scheduler = null;
        this.registered_callbacks = [];
        this.startScheduler();
    }

    startScheduler() {

        const self = this;

        if (this.scheduler == null)
            this.scheduler = setInterval(function () {
                for (let i = 0; i < self.registered_callbacks.length; i++) {
                    self.registered_callbacks[i].callback.apply(
                        self.registered_callbacks[i].context,
                        self.registered_callbacks[i].paramsArray
                    );
                }
            }, 1000)
    }

    stopScheduler() {
        if (this.scheduler != null)
            clearImmediate(this.scheduler);
        this.scheduler = null;
    }

    registerMetric(context, paramsArray, callback) {

        let callbackObj = {};
        callbackObj.uuid = uuidv4();
        callbackObj.context = context;
        callbackObj.paramsArray = paramsArray;
        callbackObj.callback = callback;

        this.registered_callbacks.push(callbackObj);

        return callbackObj.uuid;
    }

    unRegisterMetric(uuid) {
        let foundedIndex = this.registered_callbacks.findIndex(x => x.uuid === uuid);
        if (foundedIndex !== -1)
            this.registered_callbacks.splice(foundedIndex, 1);
    }
};

