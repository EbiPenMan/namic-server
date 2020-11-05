import Global from "../Global";
import UserModule from "../module/UserModule";
import {v4 as uuidv4} from 'uuid';

export default class SocketManager {
    constructor() {
        this.socketList = {};
        this.trusted_socketList = {};
        this.printMetrics_uuid = Global.instance().metricsManager.registerMetric(this, null, this.printMetrics);
        console.log("[SocketManager] - [constructor] - printMetrics_uuid: ", this.printMetrics_uuid);
    }


    onNewSocket(socket) {
        console.log("[SocketManager] - [onNewSocket] - Called.");
        socket.nomicData = {};
        socket.nomicData.socketId = uuidv4();
        this.socketList[socket.nomicData.socketId] = socket;
        new UserModule().init(socket);
    }

    onSingIn(userC) {
        console.log("[SocketManager] - [onSingIn] - Called.");
        this.trusted_socketList[userC.userProfile._id.toString()] = userC;
    }

    onSingOut(userC) {
        if (userC.userProfile && userC.userProfile._id)
            if (this.trusted_socketList[userC.userProfile._id.toString()] != null) {
                delete this.trusted_socketList[userC.userProfile._id.toString()];
            }
    }

    onSocketClose(userC) {
        this.onSingOut(userC);
        if (this.socketList[userC.socket.nomicData.socketId] != null) {
            delete this.socketList[userC.socket.nomicData.socketId];
        }
    }

    getUserC(userId) {

    }

    printMetrics() {
        console.log("[METRICS] - [SocketManager] - connected_players: ", Object.keys(this.socketList).length);
        console.log("[METRICS] - [SocketManager] - trusted_players: ", Object.keys(this.trusted_socketList).length);
    }

};

