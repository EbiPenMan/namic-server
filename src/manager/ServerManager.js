import * as http from 'http'
import WebSocketServer from "websocket";
import url from "url";
import querystring from "querystring";
import Global from "../Global";
import * as Configs from "../data/Configs";

export default class ServerManager {
    constructor() {
    }


    init() {
        this.createHttpServer();
        this.startHttpServer();
        this.createWebSocketServer();
    }


    createHttpServer() {
        this.httpServer = http.createServer();
        console.log("[ServerManager] - [createHttpServer] - Done.");
    }

    startHttpServer() {
        this.httpServer.listen(Configs.SERVER_PORT);
        console.log("[ServerManager] - [startHttpServer] - Done with port: " + Configs.SERVER_PORT);
    }

    createWebSocketServer() {
        this.wsServer = new WebSocketServer.server({
            httpServer: this.httpServer,
            autoAcceptConnections: false
        });
        console.log("[ServerManager] - [createWebSocketServer] - Done.");

        this.onRequest_WebSocketServer();
    }

    onRequest_WebSocketServer() {

        const self = this;
        console.log("[ServerManager] - [onRequest_WebSocketServer] - Called.");

        this.wsServer.on('request', function (request) {

            console.log("[ServerManager] - [onRequest_WebSocketServer] - wsServer on_request.");

            const pathname = url.parse(request.httpRequest.url).pathname;
            // const query = url.parse(request.httpRequest.url).query;
            // console.log("query: ", query);
            // console.log("querys: ", querystring.parse(query).user_name);
            // if (pathname !== '/ws' || query == null || query === "" ||
            //     querystring.parse(query).user_name == null || querystring.parse(query).user_name === "" ||
            //     querystring.parse(query).password == null || querystring.parse(query).password === "") {
            //     console.warn(`Endpoint not valid. [pathname: ${pathname}] -  [query: ${query}]`);
            //     request.reject(404, "Endpoint not valid.");
            //     return;
            // }

            const origin = url.parse(request.origin).hostname;

            if (origin !== 'localhost') {
                console.warn(`origin not valid. [origin: ${origin}]`);
                request.reject(404, "origin not valid.");
                return;
            }


            if (pathname !== '/ws') {
                console.warn(`Endpoint not valid. [pathname: ${pathname}]`);
                request.reject(404, "Endpoint not valid.");
                return;
            }

            const socket = request.accept(null, request.origin);
            Global.instance().socketManager.onNewSocket(socket);

        });

    }

};

