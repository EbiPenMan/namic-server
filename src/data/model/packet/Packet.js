export default class Packet {

    constructor(packet) {
        if (typeof packet === "string") {
            const pk = JSON.parse(packet);
            let key;

            // Object.getOwnPropertyNames(stringPacket);
            for (key in pk) {
                this[key] = pk[key];
            }
        }
        else if (typeof packet === "object") {
            const pk = JSON.parse(JSON.stringify(packet));
            let key;

            // Object.getOwnPropertyNames(stringPacket);
            for (key in pk) {
                this[key] = pk[key];
            }
        }
    }

    createResponse(ReceivedPacket) {
        this
            .setType(ReceivedPacket.type)
            .setReqIdClient(ReceivedPacket.reqIdClient)
            .setReqIdServer(ReceivedPacket.reqIdServer);
        return this;
    }

    setType(type) {
        if (type)
            this.type = type;
        return this;
    }

    setData(data) {
        this.data = data;
        return this;
    }

    setError(error) {
        if (error)
            this.error = error;
        return this;
    }

    setOpCode(opCode) {
        if (opCode)
            this.opCode = opCode;
        return this;
    }

    setReqIdServer(reqIdServer) {
        if (reqIdServer)
            this.reqIdServer = reqIdServer;
        return this;
    }

    setReqIdClient(reqIdClient) {
        if (reqIdClient)
            this.reqIdClient = reqIdClient;
        return this;
    }

    toString() {
        return JSON.stringify(this);
    }

    toBuffer() {
        return Buffer.from(this.toString(), "utf-8");
    }

};

