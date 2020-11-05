import ServerManager from "./manager/ServerManager.js";
import Global from "./Global";
import SocketManager from "./manager/SocketManager";
import DbManager from "./manager/DbManager";
import MetricsManager from "./manager/MetricsManager";


let global = new Global();

Global.instance().metricsManager = new MetricsManager();

Global.instance().serverManager = new ServerManager();
Global.instance().socketManager = new SocketManager();
Global.instance().dbManager = new DbManager();

Global.instance().serverManager.init();
