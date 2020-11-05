

export default class Global {
    constructor() {
        this.metricsManager = null;
        this.serverManager = null;
        this.socketManager = null;
        this.dbManager = null;
    }

    static instance(){
        return this;
    }

};

