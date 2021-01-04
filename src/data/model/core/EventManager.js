export default class EventManager {
    constructor() {

    }

    runEvent(eventName, data) {

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

}