import Global from "../../../Global";
import Packet from "../packet/Packet";
import {PK_TYPES_SEND, PK_TYPES_SERVER_SEND} from "../packet/PacketType";
import {
    ERROR_ALREADY_EXISTS, ERROR_ALREADY_SING_IN, ERROR_CREATE, ERROR_DB_CREATE,
    ERROR_INVALID_PARAM,
    ERROR_NOT_FOUND,
    ERROR_REQUIRED_FIELD, ERROR_UNAUTHORIZED, ERROR_UNKNOWN
} from "../packet/PacketError";
import bcrypt from "bcrypt";
import {PASSWORD_SALT_ROUNDS} from "../../Configs";
import PKD_Place_Create from "../packet/PacketData/PKD_Place_Create";

export default class UserController {
    constructor() {
        this.socket = null;
        this.userProfile = null;
    }

    init(socket) {
        this.socket = socket;
        this.setSocketCallbacks();
        this.sendPacketToUser(new Packet().setType(PK_TYPES_SERVER_SEND.CONNECTION_SUCCEED).setData({socketId: this.socket.nomicData.socketId}).toString());
    }

    setSocketCallbacks() {

        const self = this;

        self.socket.on('message', function (packet) {
            console.log("[PlayerController] - [setSocketCallbacks] - [on packet] - packet: ", packet);
            // self.socket.send('Hi this is WebSocket server!');
            if (packet.type && packet.type === "utf8") {
                self.messageHandler(JSON.parse(packet.utf8Data));
            }
            else if (packet.type && packet.type === "binary") {
                self.messageHandler(JSON.parse(packet.binaryData.toString('utf8')));
            }
        });
        self.socket.on('close', function (reasonCode, description) {
            if (self.userProfile)
                console.log(`[PlayerController] - [setSocketCallbacks] - [on close] -  reasonCode: ${reasonCode} - description: ${description} - userId: ${self.userProfile._id}`);
            else
                console.log(`[PlayerController] - [setSocketCallbacks] - [on close] -  reasonCode: ${reasonCode} - description: ${description}`);

            Global.instance().socketManager.onSocketClose(self);
        });
        // self.socket.on('error', function (reasonCode, description) {
        //     if (self.userProfile)
        //         console.log(`[PlayerController] - [setSocketCallbacks] - [on error] -  reasonCode: ${reasonCode} - description: ${description} - userId: ${self.userProfile._id}`);
        //     else
        //         console.log(`[PlayerController] - [setSocketCallbacks] - [on error] -  reasonCode: ${reasonCode} - description: ${description}`);
        //     Global.instance().socketManager.onSocketClose(self);
        // });
    }
    messageHandler(packet) {
        if (packet == null || packet === "") {
            console.warn("[PlayerController] - [messageHandler] - packet null or empty. - packet:", packet);
            return;
        }

        if (packet.type != null) {

            if (packet.type === PK_TYPES_SEND.SING_IN) {
                if (this.userProfile) {
                    this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_ALREADY_SING_IN(this.userProfile._id.toString())).toString());
                }
                else {
                    this.onSignIn(packet);
                }
            }
            else if (packet.type === PK_TYPES_SEND.SING_UP) {
                if (this.userProfile) {
                    this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_ALREADY_SING_IN(this.userProfile._id.toString())).toString());
                }
                else {
                    this.onSignUp(packet);
                }
            }
            else {
                if (this.userProfile) {
                    if (packet.type === PK_TYPES_SEND.SING_OUT) {
                        this.onSignOut(packet);
                    }
                    else if (packet.type === PK_TYPES_SEND.PLACE_CREATE) {
                        Global.instance().placeManager.onCreatePlace(packet,this);
                    }
                    else if (packet.type === PK_TYPES_SEND.PLACE_GET) {
                        Global.instance().placeManager.onGetPlace(packet,this);
                    }
                    else {
                        this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_UNKNOWN("Packet type")).toString());
                    }
                }
                else {
                    this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_UNAUTHORIZED()).toString());
                }
            }
        }
        else if (packet.opCode != null) {

        }
        else {
            console.warn("[PlayerController] - [messageHandler] - packet does not have type or opCode.", packet);
        }

    }
    sendPacketToUser(packetData) {
        this.socket.send(packetData);
    }

    onSignIn(packet) {

        const self = this;

        if (packet.data == null || packet.data.userName == null || packet.data.password == null) {
            this.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_IN).setError(ERROR_REQUIRED_FIELD("userName,password")).toString());
            return;
        }

        if (packet.data.userName === "" || packet.data.password === "") {
            this.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_IN).setError(ERROR_INVALID_PARAM("userName,password")).toString());
            return;
        }


        Global.instance().dbManager.foundDocument(
            "user",
            {userName: packet.data.userName},
            function (res) {
                console.log("[PlayerController] - [onSignIn] - db res: ", res);
                bcrypt.compare(packet.data.password, res[0].password, function (err, result) {
                    if (result != null && result === true) {
                        self.userProfile = res[0];
                        Global.instance().socketManager.onSingIn(self);
                        self.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_IN).setData(self.userProfile).toString());
                    }
                    else {
                        self.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_IN).setError(ERROR_INVALID_PARAM("password")).toString());
                    }
                });
            },
            function (error) {
                self.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_IN).setError(ERROR_NOT_FOUND("userName")).toString());
            }
        );

    }
    onSignUp(packet) {
        const self = this;

        if (packet.data == null || packet.data.userName == null || packet.data.password == null) {
            this.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setError(ERROR_REQUIRED_FIELD("userName,password")).toString());
            return;
        }

        if (packet.data.userName === "" || packet.data.password === "") {
            this.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setError(ERROR_INVALID_PARAM("userName,password")).toString());
            return;
        }

        Global.instance().dbManager.foundDocument(
            "user",
            {userName: packet.data.userName})
            .then(function (res) {
                self.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setError(ERROR_ALREADY_EXISTS("userName")).toString());
            })
            .catch(function (error) {
                    bcrypt.hash(packet.data.password, PASSWORD_SALT_ROUNDS, function (err, hash) {
                        if (hash) {
                            Global.instance().dbManager.insertDocumentOne(
                                "user",
                                {userName: packet.data.userName, password: hash})
                                .then(function (res) {
                                    self.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setData({id: res.insertedId.toString()}).toString());
                                })
                                .catch(function (error) {
                                    self.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setError(ERROR_DB_CREATE("user")).toString());
                                });
                        }
                        else {
                            self.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setError(ERROR_CREATE("user password")).toString());
                        }
                    });
                }
            );

    }
    onSignOut(packet) {
        Global.instance().socketManager.onSingOut(this);
        this.userProfile = null;
        this.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_OUT).setData({result: true}).toString());
    }


    // TODO Change password
    // TODO Player can not change userName but admin can do this
    // TODO Update user profile (other general fields like name - email - mobile)


};

