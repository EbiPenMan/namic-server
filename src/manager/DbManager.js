import mongo from "mongodb";
import {DB_NAME, DB_URL} from "../data/Configs";

export default class DbManager {
    constructor() {
        this.db_url = DB_URL;
        this.db_name = DB_NAME;
        this.connectedDb = null;

    }

    init() {
        console.log("[DbManager] - [init] - Called.");
        this.createOrConnectToDb();
    }

    dbIsConnected() {
        if (this.connectedDb == null)
            return false;
        this.connectedDb.isConnected();
    }

    getConnectedDb() {
        if (this.connectedDb == null)
            return null;
        else if (this.connectedDb.isConnected === true)
            return this.connectedDb;
        else
            return null;
    }

    createOrConnectToDb(onDone, OnError) {
        console.log("[DbManager] - [createOrConnectToDb] - Called.");

        const self = this;

        const connectedDb = this.getConnectedDb();

        return new Promise((resolve, reject) => {

            if (connectedDb != null) {
                if (onDone)
                    onDone(connectedDb);
                else
                    resolve(connectedDb);
                return;
            }

            mongo.MongoClient.connect(self.db_url, {useUnifiedTopology: true})
                .then(function (db) {
                    console.log("[DbManager] - [createOrConnectToDb] - Database connected!");
                    let dbo = db.db(self.db_name);
                    self.connectedDb = dbo;
                    if (onDone)
                        onDone(dbo);
                    else
                        resolve(dbo);
                })
                .catch(
                    function (err) {
                        console.log("[DbManager] - [createOrConnectToDb] - error on connecting to db, error: ", err);
                        if (OnError)
                            OnError(err);
                        else
                            reject(err);
                    }
                );
        });
    }

    insertDocumentOne(collectionName, docObj, onDone, OnError) {

        const self = this;

        console.log("[DbManager] - [insertDocumentOne] - Called.");
        return new Promise((resolve, reject) => {

            self.createOrConnectToDb()
                .then(function (db) {
                    db.collection(collectionName).insertOne(docObj, {}, function (errC, resC) {
                        if (errC) {
                            console.log("[DbManager] - [insertDocumentOne] - error on insert doc, error: ", errC);
                            if (OnError)
                                OnError(errC);
                            else
                                reject(errC);
                        } else {
                            console.log("[DbManager] - [insertDocumentOne] - 1 document inserted to " + collectionName);
                            if (onDone)
                                onDone(resC);
                            else
                                resolve(resC);
                        }
                    });

                })
                .catch(function (err) {
                    console.log("[DbManager] - [insertDocumentOne] - error on connecting to db, error: ", err);
                    if (OnError)
                        OnError(err);
                    else
                        reject(err);
                });
        });
    }

    foundDocument(collectionName, docFields, onDone, OnError) {

        const self = this;

        console.log("[DbManager] - [foundDocument] - Called.");
        return new Promise((resolve, reject) => {
            self.createOrConnectToDb(
                function (db) {
                    db.collection(collectionName).find(docFields).toArray(function (errC, resC) {
                        console.log(`[DbManager] - [foundDocument] - found ${resC.length} document from ` + collectionName);
                        if (resC.length === 0) {
                            if (OnError)
                                OnError("not found");
                            else
                                reject("not found");
                        } else {
                            if (onDone)
                                onDone(resC);
                            else
                                resolve(resC);
                        }
                    });
                },
                function (err) {
                    console.log("[DbManager] - [foundDocument] - error on found doc, error: ", err);
                    if (OnError)
                        OnError(err);
                    else
                        reject(err);
                });
        });
    }

    foundDocumentById(collectionName, idStr, onDone, OnError) {

        const self = this;

        console.log("[DbManager] - [foundDocumentById] - Called.");
        return new Promise((resolve, reject) => {

            self.createOrConnectToDb()
                .then(function (db) {
                    const o_id = new mongo.ObjectID(idStr);
                    db.collection(collectionName).findOne({'_id': o_id}, function (errC, resC) {
                        console.log(`[DbManager] - [foundDocumentById] - found ${JSON.stringify(resC)} document from ` + collectionName);
                        if (onDone)
                            onDone(resC);
                        else
                            resolve(resC);
                    });
                })
                .catch(function (err) {
                    console.log("[DbManager] - [foundDocumentById] - error on found doc, error: ", err);
                    if (OnError)
                        OnError(err);
                    else
                        reject(err);
                });
        });
    }

    updateDocument(collectionName, docFields, docObj, options = null, onDone = null, OnError = null) {

        const self = this;

        console.log("[DbManager] - [updateDocument] - Called.");
        return new Promise((resolve, reject) => {

            self.createOrConnectToDb()
                .then(function (db) {
                    db.collection(collectionName).update(docFields, docObj, options, function (errC, resC) {
                        if (errC) {
                            console.log("[DbManager] - [updateDocument] - error on update doc, error: ", errC);
                            if (OnError)
                                OnError(errC);
                            else
                                reject(errC);
                        } else {
                            console.log("[DbManager] - [updateDocument] - 1 document updated  " + collectionName);
                            if (onDone)
                                onDone(resC);
                            else
                                resolve(resC);
                        }
                    });
                })
                .catch(function (err) {
                    console.log("[DbManager] - [updateDocument] - error on connecting to db, error: ", err);
                    if (OnError)
                        OnError(err);
                    else
                        reject(err);
                });
        });
    }

    removeDocument(collectionName, docFields, onDone, OnError) {

        const self = this;

        console.log("[DbManager] - [removeDocument] - Called.");
        return new Promise((resolve, reject) => {

            self.createOrConnectToDb()
                .then(function (db) {
                    db.collection(collectionName).remove(docFields, function (errC, resC) {
                        if (errC) {
                            console.log("[DbManager] - [removeDocument] - error on remove doc, error: ", errC);
                            if (OnError)
                                OnError(errC);
                            else
                                reject(errC);
                        } else {
                            console.log("[DbManager] - [removeDocument] - 1 document removed  " + collectionName);
                            if (onDone)
                                onDone(resC);
                            else
                                resolve(resC);
                        }
                    });
                })
                .catch(function (err) {
                    console.log("[DbManager] - [removeDocument] - error on connecting to db, error: ", err);
                    if (OnError)
                        OnError(err);
                    else
                        reject(err);
                });
        });
    }

};

