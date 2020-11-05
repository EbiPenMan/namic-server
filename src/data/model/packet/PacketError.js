//region --- Packet ---


export const ERROR_GENERAL_PARSE_DATA = function (name) {
    if (name)
        return {
            code: 101001,
            codeStr: ERROR_GENERAL_PARSE_DATA.name,
            message: `Error on parsing the packet data ${name}.`
        };
    return {
        code: 101001,
        codeStr: ERROR_GENERAL_PARSE_DATA.name,
        message: "Error on parsing the packet data."
    };
};

export const ERROR_GENERAL_INVALID_SHOULD_STATE = function (name) {
    if (name)
        return {
            code: 101002,
            codeStr: ERROR_GENERAL_INVALID_SHOULD_STATE.name,
            message: `Error on invalid state of ${name}.`
        };
    return {
        code: 101002,
        codeStr: ERROR_GENERAL_INVALID_SHOULD_STATE.name,
        message: "Error on invalid state."
    };
};


//endregion

//region --- Packet ---

export const ERROR_PACKET_EMPTY_DATA = function (name) {
    if (name)
        return {
            code: 102001,
            codeStr: ERROR_PACKET_EMPTY_DATA.name,
            message: `Packet null or empty ${name}.`
        };
    return {
        code: 102001,
        codeStr: ERROR_PACKET_EMPTY_DATA.name,
        message: "Packet null or empty."
    };
};

export const ERROR_PACKET_UNDEFINED = function (name) {
    if (name)
        return {
            code: 102002,
            codeStr: ERROR_PACKET_UNDEFINED.name,
            message: `Packet does not have type or opCode ${name}.`
        };
    return {
        code: 102002,
        codeStr: ERROR_PACKET_UNDEFINED.name,
        message: "Packet does not have type or opCode."
    };
};

//endregion

export const ERROR_NOT_FOUND = function (name) {
    if (name)
        return {
            code: 601,
            codeStr: ERROR_NOT_FOUND.name,
            message: `Not found ${name}.`
        };
    return {
        code: 601,
        codeStr: ERROR_NOT_FOUND.name,
        message: "Not found."
    };
};

export const ERROR_INVALID_PARAM = function (name) {
    if (name)
        return {
            code: 602,
            codeStr: ERROR_INVALID_PARAM.name,
            message: `Invalid Param ${name}.`
        };
    return {
        code: 602,
        codeStr: ERROR_INVALID_PARAM.name,
        message: "Invalid Param."
    };
};

export const ERROR_REQUIRED_FIELD = function (name) {
    if (name)
        return {
            code: 603,
            codeStr: ERROR_REQUIRED_FIELD.name,
            message: `Required field ${name}.`
        };
    return {
        code: 603,
        codeStr: ERROR_REQUIRED_FIELD.name,
        message: "Required field."
    };
};

export const ERROR_ALREADY_EXISTS = function (name) {
    if (name)
        return {
            code: 604,
            codeStr: ERROR_ALREADY_EXISTS.name,
            message: `Already exists ${name}.`
        };
    return {
        code: 604,
        codeStr: ERROR_ALREADY_EXISTS.name,
        message: "Already exists."
    };
};

export const ERROR_CREATE = function (name) {
    if (name)
        return {
            code: 605,
            codeStr: ERROR_CREATE.name,
            message: `Create ${name}.`
        };
    return {
        code: 605,
        codeStr: ERROR_CREATE.name,
        message: "Create."
    };
};

export const ERROR_DB_CREATE = function (name) {
    if (name)
        return {
            code: 606,
            codeStr: ERROR_DB_CREATE.name,
            message: `DB create ${name}.`
        };
    return {
        code: 606,
        codeStr: ERROR_DB_CREATE.name,
        message: "DB create."
    };
};

export const ERROR_UNAUTHORIZED = function (name) {
    if (name)
        return {
            code: 607,
            codeStr: ERROR_UNAUTHORIZED.name,
            message: `Unauthorized ${name}.`
        };
    return {
        code: 607,
        codeStr: ERROR_UNAUTHORIZED.name,
        message: "Unauthorized."
    };
};

export const ERROR_UNKNOWN = function (name) {
    if (name)
        return {
            code: 608,
            codeStr: ERROR_UNKNOWN.name,
            message: `Unknown ${name}.`
        };
    return {
        code: 608,
        codeStr: ERROR_UNKNOWN.name,
        message: "Unknown."
    };
};

export const ERROR_ALREADY_SING_IN = function (name) {
    if (name)
        return {
            code: 608,
            codeStr: ERROR_ALREADY_SING_IN.name,
            message: `Already sing-in ${name}.`
        };
    return {
        code: 608,
        codeStr: ERROR_ALREADY_SING_IN.name,
        message: "Already sing-in."
    };
};
