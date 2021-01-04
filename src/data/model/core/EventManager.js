import Global from "../../../Global";
import {EVENT_NAMES} from "../event/EventEnums";
import Packet from "../packet/Packet";
import {PK_TYPES_SEND} from "../packet/PacketType";
import {ERROR_NOT_FOUND} from "../packet/PacketError";

export default class EventManager {
    constructor() {

    }

    runEvent(eventName,eventActionType, data) {
        console.log(`[EventManager] - [runEvent] - eventName: ${eventName} | actionType: ${eventActionType}`);

        return Promise.resolve(
            {
                newData: data,
                validate:
                    {
                        result: true,
                        reason: {
                            lawId: "123",
                            conditionId: "123",
                            message: ""
                        }
                    }
            }
        );

        // return Promise.reject(
        //     {
        //         newData: data,
        //         validate:
        //             {
        //                 result: true,
        //                 reason: {
        //                     lawId: "123",
        //                     conditionId: "123",
        //                     message: ""
        //                 }
        //             }
        //     }
        // );

    }



    onGetEvent(packet,userC) {
        const self = this;

        if (packet.data.parentEventId) {
            this.getEventChild(packet.data.parentEventId)
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setData(res).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setError(ERROR_NOT_FOUND("event")).toString());
                });
        }
        else if (packet.data.eventId) {
            this.getEvent(packet.data.eventId)
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setData(res).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setError(ERROR_NOT_FOUND("event")).toString());
                });
        }
        else {
            this.getGameRootEvent()
                .then(function (res) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setData(res).toString())
                })
                .catch(function (error) {
                    userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.PLACE_GET).setError(ERROR_NOT_FOUND("event")).toString());
                });
        }
    }
    
    createEvent(data) {


        if (data.parentEventId == null || data.parentEventId === "") {
            // TODO must be admin for create game root event
            // return Promise.reject("dont have access.");
            return Promise.reject("forbidden");
        }

        //TODO run events

        return Global.instance().eventManager.runEvent(EVENT_NAMES.PLACE_CREATE,
            data)
            .then(function (eventResult) {
                return Global.instance().dbManager.insertDocumentOne(
                    "core-event",
                    data);
            })
            .catch(function (eventError) {
                return Promise.reject(eventError)
            });


    }

    updateEvent(eventId, docObj) {
        return Global.instance().dbManager.updateDocument("core-event", {_id: eventId}, docObj);
    }

    deleteEvent(eventId) {
        return Global.instance().dbManager.removeDocument("core-event", {_id: eventId});
    }


}
