

export default class Global {
    constructor() {
        this.metricsManager = null;
        this.serverManager = null;
        this.socketManager = null;
        this.dbManager = null;
        this.placeManager = null;
        this.roleManager = null;
        this.lawManager = null;
        this.eventManager = null;
    }

    static instance(){
        return this;
    }

};

