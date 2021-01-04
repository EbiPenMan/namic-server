import Global from "../../../Global";
import Packet from "../packet/Packet";
import {PK_TYPES_SEND} from "../packet/PacketType";
import {ERROR_DB_CREATE} from "../packet/PacketError";
import {EVENT_NAMES} from "../event/EventEnums";

export default class RoleManager {
    constructor() {

    }

    getRole(roleId) {
        return Global.instance().dbManager.foundDocumentById("role", roleId);
    }

    // get - remove all roles by placeId

    onCreateRole(packet, userC) {
        const self = this;
        this.createRole(
            userC.userProfile._id,
            packet.data.name,
            packet.data.parentPlaceId
        ).then(function (res) {
            userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.ROLE_CREATE).setData({id: res.insertedId.toString()}).toString())
        }).catch(function (error) {
            userC.sendPacketToUser(new Packet().createResponse(packet).setType(PK_TYPES_SEND.ROLE_CREATE).setError(ERROR_DB_CREATE("role")).toString());
        });
    }


    createRole(data) {

        return Global.instance().eventManager.runEvent(EVENT_NAMES.ROLE_CREATE,
            data)
            .then(function (eventResult) {
                return Global.instance().dbManager.insertDocumentOne(
                    "role",
                    data);
            })
            .catch(function (eventError) {
                return Promise.reject(eventError)
            });

    }

    updateRole(roleId, docObj) {
        return Global.instance().dbManager.updateDocument("role", {_id: roleId}, docObj);
    }

    deleteRole(roleId) {
        return Global.instance().dbManager.removeDocument("role", {_id: roleId});
    }

}