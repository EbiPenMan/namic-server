import Global from "../../../Global";
import Packet from "../packet/Packet";
import {PK_TYPES_SERVER_SEND} from "../packet/PacketType";
import {ERROR_ALREADY_EXISTS, ERROR_CREATE, ERROR_DB_CREATE} from "../packet/PacketError";
import bcrypt from "bcrypt";
import {PASSWORD_SALT_ROUNDS} from "../../Configs";

export default class LawManager {
    constructor() {

    }


    getLaw(lawId) {
        return Global.instance().dbManager.foundDocumentById("law", lawId);
    }

    // get - remove all laws by placeId

    createLaw(parentPlaceId , name,des,eventIdList , conditionIdList) {

        let docObj = {parentPlaceId : parentPlaceId ,
            name: name,
            des: des,
            eventIdList: eventIdList,
            conditionIdList: conditionIdList
        };

        return Global.instance().dbManager.insertDocumentOne(
            "law",
            docObj);

    }

    updateLaw(lawId, docObj) {
        return Global.instance().dbManager.updateDocument("law", {_id: lawId}, docObj);
    }

    deleteLaw(lawId) {
        return Global.instance().dbManager.removeDocument("law", {_id: lawId});
    }

}