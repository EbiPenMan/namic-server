import Global from "../Global";
import Packet from "../data/model/packet/Packet";
import {PK_TYPES_SEND, PK_TYPES_SERVER_SEND} from "../data/model/packet/PacketType";
import {
    ERROR_ALREADY_EXISTS,
    ERROR_ALREADY_SING_IN,
    ERROR_CREATE,
    ERROR_DB_CREATE, ERROR_DB_UPDATE,
    ERROR_GENERAL_INVALID_SHOULD_STATE,
    ERROR_GENERAL_PARSE_DATA,
    ERROR_INVALID_PARAM,
    ERROR_NOT_FOUND,
    ERROR_PACKET_EMPTY_DATA,
    ERROR_PACKET_UNDEFINED,
    ERROR_REQUIRED_FIELD,
    ERROR_UNAUTHORIZED,
    ERROR_UNKNOWN
} from "../data/model/packet/PacketError";
import bcrypt from "bcrypt";
import {PASSWORD_SALT_ROUNDS} from "../data/Configs";
import PKD_Place_Create from "../data/model/packet/PacketData/PKD_Place_Create";
import LoginUserPassModule from "./login/LoginUserPassModule";
import {LoginPlatformType} from "../data/enum/LoginPlatformType";
import mongo from "mongodb";

export default class UserModule {
    constructor() {
        this.socket = null;
        this.userProfile = null;
        this.currentLoginPlatform = null;
    }

    init(socket) {
        this.socket = socket;
        this.setSocketCallbacks();
        this.sendPacketToUser(new Packet().setType(PK_TYPES_SERVER_SEND.CONNECTION_SUCCEED).setData({socketId: this.socket.nomicData.socketId}).toString());
    }

    setSocketCallbacks() {

        const self = this;

        self.socket.on('message', function (packet) {
            console.log("[PlayerController] - [setSocketCallbacks] - [on packet] - packet: ");
            // self.socket.send('Hi this is WebSocket server!');
            if (packet.type && packet.type === "utf8") {
                if (packet.utf8Data != null && packet.utf8Data !== "") {
                    try {
                        self.messageHandler(atob(JSON.parse(packet.utf8Data)));
                    } catch (e) {
                        console.warn("[PlayerController] - [messageHandler] - packet parsing error. - packet:", packet);
                        self.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_GENERAL_PARSE_DATA()).toString());
                    }
                } else {
                    console.warn("[PlayerController] - [messageHandler] - packet null or empty. - packet:", packet);
                    self.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_PACKET_EMPTY_DATA()).toString());
                }
            } else if (packet.type && packet.type === "binary") {
                if (packet.binaryData != null && packet.binaryData !== "") {
                    try {
                        let data = packet.binaryData.toString('utf8');
                        let buff = new Buffer(data, 'base64');
                        let text = buff.toString('utf8');
                        self.messageHandler(JSON.parse(text));
                    } catch (e) {
                        console.warn("[PlayerController] - [messageHandler] - packet parsing error. - packet:", packet);
                        self.sendPacketToUser(new Packet().createResponse(JSON.parse(packet.binaryData.toString('utf8'))).setError(ERROR_GENERAL_PARSE_DATA()).toString());
                    }
                } else {
                    console.warn("[PlayerController] - [messageHandler] - packet null or empty. - packet:", packet);
                    self.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_PACKET_EMPTY_DATA()).toString());
                }
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
            this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_PACKET_EMPTY_DATA()).toString());
            return;
        }

        if (packet.type != null) {

            if (packet.type === PK_TYPES_SEND.SING_IN) {
                if (this.userProfile) {
                    this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_ALREADY_SING_IN(this.userProfile._id.toString())).toString());
                } else {
                    this.onSignIn(packet);
                }
            } else if (packet.type === PK_TYPES_SEND.SING_UP) {
                if (this.userProfile) {
                    this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_ALREADY_SING_IN(this.userProfile._id.toString())).toString());
                } else {
                    this.onSignUp(packet);
                }
            } else {
                if (this.userProfile) {
                    if (packet.type === PK_TYPES_SEND.SING_OUT) {
                        this.onSignOut(packet);
                    } else if (packet.type === PK_TYPES_SEND.UPDATE_MUTABLE_DATA) {
                        this.onUpdateMutableData(packet);
                    } else if (packet.type === PK_TYPES_SEND.PLACE_CREATE) {
                        Global.instance().placeManager.onCreatePlace(packet, this);
                    } else if (packet.type === PK_TYPES_SEND.PLACE_GET) {
                        Global.instance().placeManager.onGetPlace(packet, this);
                    } else if (packet.type === PK_TYPES_SEND.PLACE_GET_MY) {
                        Global.instance().placeManager.onGetMyPlace(packet, this);
                    } else if (packet.type === PK_TYPES_SEND.PLACE_JOIN) {
                        Global.instance().placeManager.onJoinPlace(packet, this);
                    } else if (packet.type === PK_TYPES_SEND.PLACE_LEAVE) {
                        Global.instance().placeManager.onLeavePlace(packet, this);
                    }
                    else {
                        this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_UNKNOWN("Packet type")).toString());
                    }
                } else {
                    this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_UNAUTHORIZED()).toString());
                }
            }
        } else if (packet.opCode != null) {

        } else {
            console.warn("[PlayerController] - [messageHandler] - packet does not have type or opCode.", packet);
            this.sendPacketToUser(new Packet().createResponse(packet).setError(ERROR_PACKET_UNDEFINED()).toString());
        }

    }

    sendPacketToUser(packetData) {
        // this.socket.sendUTF(packetData);
        // this.socket.sendBytes(this.stringToArrayBuffer(JSON.stringify(packetData)));
        let data = packetData;
        let buff = Buffer.from(data);
        let base64data = buff.toString('base64');
        this.socket.sendBytes(Buffer.from(base64data, 'utf8'));

        // this.socket.sendFrame()
    }

    onSignIn(packet) {

        const self = this;

        if (packet.data == null || packet.data.loginPlatformType == null || packet.data.loginPlatformType === "") {
            this.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_IN).setError(ERROR_REQUIRED_FIELD("loginPlatformType")).toString());
            return;
        }

        if (this.getCurrentLoginPlatform() != null) {
            console.warn("[PlayerController] - [onSignIn] - Current Login Platform not null. - loginPlatformType:", packet.data.loginPlatformType);
            this.sendPacketToUser(new Packet().createResponse(packet).setError(
                ERROR_GENERAL_INVALID_SHOULD_STATE("Current Login Platform not null")).toString());
        } else {
            this.currentLoginPlatform = this.createCurrentLoginPlatform(packet.data.loginPlatformType);
            this.getCurrentLoginPlatform().onSignIn(packet)
                .then(function (res) {
                    self.userProfile = res[0];
                    Global.instance().socketManager.onSingIn(self);
                })
                .catch(function (error) {
                    self.currentLoginPlatform = null;
                });
        }

    }

    onSignUp(packet) {
        const self = this;

        if (packet.data == null || packet.data.loginPlatformType == null || packet.data.loginPlatformType === "") {
            this.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setError(ERROR_REQUIRED_FIELD("loginPlatformType")).toString());
            return;
        }
        if (this.getCurrentLoginPlatform() != null) {
            console.warn("[PlayerController] - [onSignUp] - Current Login Platform not null. - loginPlatformType:", packet.data.loginPlatformType);
            this.sendPacketToUser(new Packet().createResponse(packet).setError(
                ERROR_GENERAL_INVALID_SHOULD_STATE("Current Login Platform not null")).toString());
        } else {
            let tempCurrentLoginPlatform = this.createCurrentLoginPlatform(packet.data.loginPlatformType);
            tempCurrentLoginPlatform.onSignUp(packet);
        }

    }

    onSignOut(packet) {
        Global.instance().socketManager.onSingOut(this);
        this.userProfile = null;
        this.currentLoginPlatform = null;
        this.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_OUT).setData({result: true}).toString());
    }

    onUpdateMutableData(packet) {
        const self = this;

        this.userProfile.mutableData = packet.data;
        this.userProfile.privateData = {test: 123};
        const o_id = new mongo.ObjectID(this.userProfile._id);
        const docObj = {
            $set: {
                mutableData: this.userProfile.mutableData,
            },
        };
        Global.instance().dbManager.updateDocument(
            "user",
            {'_id': o_id},
            docObj,null,
            function (res) {
                self.sendPacketToUser(new Packet().createResponse(packet).setData({
                    result: res.result,
                    mutableData: self.userProfile.mutableData
                }).toString());
            }, function (error) {
                console.error("[PlayerController] - [onUpdateMutableData] - error on update mutableData, error: ", error);
                self.sendPacketToUser(new Packet().createResponse(packet).setError(
                    ERROR_DB_UPDATE("user.mutableData")).toString());
            })

    }

    createCurrentLoginPlatform(loginPlatformType) {
        if (loginPlatformType === LoginPlatformType.USER_PASS) {
            return new LoginUserPassModule(this);
        }
        return null;
    }

    getCurrentLoginPlatform() {
        return this.currentLoginPlatform;
    }

    stringToArrayBuffer(binary_string) {
        let len = binary_string.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }

    onJoinPlace(packet){
        const self = this;

          if(packet.data == null || packet.data.placeId == null){
              self.sendPacketToUser(new Packet().createResponse(packet).setError(
                  ERROR_REQUIRED_FIELD("placeId")).toString());
              return;
          }

        const o_id = new mongo.ObjectID(this.userProfile._id);
        const docObj = {$set: { placeId: packet.data.placeId ,userId: this.userProfile._id} };
        Global.instance().dbManager.updateDocument(
            "link-user-place",
            {placeId: packet.data.placeId ,userId: this.userProfile._id },
            docObj,null,
            {upsert:true},
            function (res) {
                self.sendPacketToUser(new Packet().createResponse(packet).setData({
                    result: res.result,
                }).toString());
            }, function (error) {
                console.error("[PlayerController] - [onJoinPlace] - error on update placeIdList, error: ", error);
                self.sendPacketToUser(new Packet().createResponse(packet).setError(
                    ERROR_DB_UPDATE("user.placeIdList")).toString());
            })
    }
    onLeavePlace(packet){
        const self = this;
        let foundedPlaceIdIndex = -1;

        if(this.userProfile.placeIdList == null){
            self.sendPacketToUser(new Packet().createResponse(packet).setError(
                ERROR_NOT_FOUND("placeIdList is empty")).toString());
            return;
        }
        else{
            foundedPlaceIdIndex = this.userProfile.placeIdList.findIndex(x => x === packet.data.placeId);
            if(foundedPlaceIdIndex === -1){
                self.sendPacketToUser(new Packet().createResponse(packet).setError(
                    ERROR_NOT_FOUND("placeId not in user")).toString());
                return;
            }

        }

        const o_id = new mongo.ObjectID(this.userProfile._id);
        const docObj = {$pull: { placeIdList: packet.data.placeId } };
        Global.instance().dbManager.updateDocument(
            "user",
            {'_id': o_id},
            docObj,null,
            function (res) {
                self.userProfile.placeIdList.splice(foundedPlaceIdIndex , 1);
                self.sendPacketToUser(new Packet().createResponse(packet).setData({
                    result: res.result,
                    placeIdList: self.userProfile.placeIdList
                }).toString());

                Global.instance().placeManager.onLeavePlace(packet, this);


            }, function (error) {
                console.error("[PlayerController] - [onLeavePlace] - error on update placeIdList, error: ", error);
                self.sendPacketToUser(new Packet().createResponse(packet).setError(
                    ERROR_DB_UPDATE("user.placeIdList")).toString());
            })
    }
};

