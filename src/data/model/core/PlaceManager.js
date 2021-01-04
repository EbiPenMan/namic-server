import Global from "../../../Global";
import Packet from "../packet/Packet";
import {PK_TYPES_SEND, PK_TYPES_SERVER_SEND} from "../packet/PacketType";
import {ERROR_DB_CREATE, ERROR_NOT_FOUND} from "../packet/PacketError";
import {EVENT_NAMES} from "../event/EventEnums";

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

    onCreatePlace(packet , userC) {
        const self = this;
        packet.creatorId = userC.userProfile._id;
        this.createPlace(packet.data,
        ).then(function (res) {
            userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_CREATE).setData({id: res.insertedId.toString()}).toString())
        }).catch(function (error) {
            userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_CREATE).setError(ERROR_DB_CREATE("place")).toString());
        });
    }
    onGetPlace(packet,userC) {
        const self = this;

        if (packet.data.parentPlaceId) {
            this.getPlaceChild(packet.data.parentPlaceId)
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setData(res).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setError(ERROR_NOT_FOUND("place")).toString());
                });
        }
        else if (packet.data.placeId) {
            this.getPlace(packet.data.placeId)
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setData(res).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setError(ERROR_NOT_FOUND("place")).toString());
                });
        }
        else {
            this.getGameRootPlace()
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setData(res).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.SING_UP).setError(ERROR_NOT_FOUND("place")).toString());
                });
        }

    }


    getGameRootPlace() {
        return Global.instance().dbManager.foundDocument("place", {parentPlaceId: {$exists: false}});
    }

    getPlace(placeId) {
        return Global.instance().dbManager.foundDocumentById("place", placeId);
    }

    getPlaceChild(parentPlaceId) {
        return Global.instance().dbManager.foundDocument("place", {parentPlaceId: parentPlaceId});
    }

    getRoleList(parentPlaceId) {
        return Global.instance().dbManager.foundDocument("role", {parentPlaceId: parentPlaceId});
    }

    getLawList(parentPlaceId) {
        return Global.instance().dbManager.foundDocument("law", {parentPlaceId: parentPlaceId});
    }


    createPlace(data) {


        if (data.parentPlaceId == null || data.parentPlaceId === "" && true) {
            // TODO must be admin for create game root place
            // return Promise.reject("dont have access.");
            return Promise.reject("forbidden");
        }

        //TODO run events

        return Global.instance().eventManager.runEvent(EVENT_NAMES.PLACE_CREATE,
            data)
            .then(function (eventResult) {
                return Global.instance().dbManager.insertDocumentOne(
                    "place",
                    data);
            })
            .catch(function (eventError) {
                return Promise.reject(eventError)
            });


    }

    updatePlace(placeId, docObj) {
        return Global.instance().dbManager.updateDocument("law", {_id: placeId}, docObj);
    }

    deletePlace(placeId) {
        return Global.instance().dbManager.removeDocument("law", {_id: placeId});
    }

}