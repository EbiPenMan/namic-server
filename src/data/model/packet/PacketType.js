
// export const PK_CONNECTION_SUCCEED = function (id) {
//     return Buffer.alloc(10).fill(JSON.stringify({type:"CONNECTION_SUCCEED" , data:{id:id}}));
// };
//
// export const PK_TEST_BUFFER = function () {
//     return Buffer.alloc(10).fill("65535");
// };

export const PK_TYPES_SEND = {

    SING_IN : "SING_IN",
    SING_UP : "SING_UP",
    SING_OUT : "SING_OUT",
    UPDATE_MUTABLE_DATA : "UPDATE_MUTABLE_DATA",

    PLACE_CREATE : "PLACE_CREATE",
    PLACE_GET : "PLACE_GET",
    PLACE_GET_MY : "PLACE_GET_MY",
    PLACE_DELETE : "PLACE_DELETE",
    PLACE_UPDATE : "PLACE_UPDATE",
    PLACE_JOIN : "PLACE_JOIN",
    PLACE_LEAVE : "PLACE_LEAVE",

    ROLE_CREATE : "ROLE_CREATE",
    ROLE_GET : "ROLE_GET",
    ROLE_DELETE : "ROLE_DELETE",
    ROLE_UPDATE : "ROLE_UPDATE",

    LAW_CREATE : "LAW_CREATE",
    LAW_GET : "LAW_GET",
    LAW_DELETE : "LAW_DELETE",
    LAW_UPDATE : "LAW_UPDATE",
};


export const PK_TYPES_SERVER_SEND = {
    CONNECTION_SUCCEED : "CONNECTION_SUCCEED",
};

export const PK_TYPES_CLIENT_SEND = {

};
