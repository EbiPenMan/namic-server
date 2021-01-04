import Global from "../../../Global";
import Packet from "../packet/Packet";
import {PK_TYPES_SEND, PK_TYPES_SERVER_SEND} from "../packet/PacketType";
import {ERROR_DB_CREATE, ERROR_NOT_FOUND} from "../packet/PacketError";
import {EVENT_NAMES} from "../event/EventEnums";
import mongo from "mongodb";

export default class PlaceManager {
    constructor() {
        this.placeProperties = {
            _id: null,
            name: null,
            picUrl: null
        };

        this.roleList = null; // get separated
        this.placeList = null; // get separated
        this.lawList = null; // get separated
    }


    // TODO Get place with or without place parent
    // TODO Get role list
    // TODO Get place list
    // TODO Get law list

    onCreatePlace(packet, userC) {
        const self = this;
        packet.creatorId = userC.userProfile._id;
        this.createPlace(packet.data,
        ).then(function (res) {
            userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_CREATE).setData({id: res.insertedId.toString()}).toString())
        }).catch(function (error) {
            userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_CREATE).setError(ERROR_DB_CREATE("place")).toString());
        });
    }

    onGetPlace(packet, userC) {
        const self = this;

        if (packet.data && packet.data.parentPlaceId) {
            this.getPlaceChild(packet.data.parentPlaceId)
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setData(res).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setError(ERROR_NOT_FOUND("place")).toString());
                });
        } else if (packet.data && packet.data.placeId) {
            this.getPlace(packet.data.placeId)
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setData(res).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setError(ERROR_NOT_FOUND("place")).toString());
                });
        } else {
            this.getGameRootPlace()
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setData(res).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setError(ERROR_NOT_FOUND("place")).toString());
                });
        }
    }

    onGetMyPlace(packet, userC) {
        const self = this;
        this.getMyPlace(userC)
            .then(function (res) {
                userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET_MY).setData(res).toString())
            })
            .catch(function (error) {
                userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET_MY).setError(ERROR_NOT_FOUND("place")).toString());
            });

    }


    onJoinPlace(packet, userC) {
        const self = this;

        if (packet.data.placeId) {
            const o_id = new mongo.ObjectID(packet.data.placeId);
            const docObj = {$addToSet: {userIdList: userC.userProfile._id.toString()}};
            // const docObj = {z: userC.userProfile._id.toString()};
            this.updatePlace(o_id, docObj)
                //TODO result
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_JOIN)
                        .setData({res : res }).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet)
                        .setError(ERROR_NOT_FOUND("userIdList")).toString());
                });
        } else {
            userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_JOIN)
                .setError(ERROR_NOT_FOUND("place")).toString());
        }

    }

    onLeavePlace(packet, userC) {
        const self = this;

        if (packet.data.placeId) {
            const o_id = new mongo.ObjectID(packet.data.placeId);
            const docObj = {$pull: {userIdList: userC.userProfile._id.toString()}};
            this.updatePlace(o_id, docObj)
                .then(function (res) {
                    //TODO result
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_LEAVE)
                        .setData({res : res }).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet)
                        .setError(ERROR_NOT_FOUND("userIdList")).toString());
                });
        } else {
            userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_LEAVE)
                .setError(ERROR_NOT_FOUND("place")).toString());
        }

    }


    getGameRootPlace() {
        return Global.instance().dbManager.foundDocument("core-place",
            {
                $or: [
                    {parentPlaceId: {$exists: false}},
                    {parentPlaceId: null},
                    {parentPlaceId: ""}
                ]
            });
    }

    getMyPlace(userC) {
        return Global.instance().dbManager.foundDocument("core-place", {userIdList: userC.userProfile._id});
    }

    getPlace(placeId) {
        return Global.instance().dbManager.foundDocumentById("core-place", placeId);
    }

    getPlaceChild(parentPlaceId) {
        return Global.instance().dbManager.foundDocument("core-place", {parentPlaceId: parentPlaceId});
    }

    getRoleList(parentPlaceId) {
        return Global.instance().dbManager.foundDocument("core-role", {parentPlaceId: parentPlaceId});
    }

    getLawList(parentPlaceId) {
        return Global.instance().dbManager.foundDocument("core-law", {parentPlaceId: parentPlaceId});
    }


    createPlace(data) {


        if (data.parentPlaceId == null || data.parentPlaceId === "") {
            // TODO must be admin for create game root place
            // return Promise.reject("dont have access.");
            return Promise.reject("forbidden");
        }

        //TODO run events

        return Global.instance().eventManager.runEvent(EVENT_NAMES.PLACE_CREATE, EVENT_ACTION_TYPE.BEFORE,
            data)
            .then(function (eventResult) {
                return Global.instance().dbManager.insertDocumentOne(
                    "core-place",
                    eventResult.newData).then(Global.instance().eventManager.runEvent(
                    EVENT_NAMES.PLACE_CREATE, EVENT_ACTION_TYPE.BEFORE,
                    data));
            })
            .catch(function (eventError) {
                return Promise.reject(eventError)
            });


    }

    updatePlace(placeId, docObj) {
        return Global.instance().dbManager.updateDocument("core-place", {_id: placeId}, docObj);
    }

    deletePlace(placeId) {
        return Global.instance().dbManager.removeDocument("core-place", {_id: placeId});
    }

}
