
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

};


export const PK_TYPES_SERVER_SEND = {
    CONNECTION_SUCCEED : "CONNECTION_SUCCEED",
};

export const PK_TYPES_CLIENT_SEND = {

};
