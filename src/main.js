import ServerManager from "./manager/ServerManager.js";
import Global from "./Global";
import SocketManager from "./manager/SocketManager";
import DbManager from "./manager/DbManager";
import MetricsManager from "./manager/MetricsManager";
import PlaceManager from "./data/model/core/PlaceManager";
import RoleManager from "./data/model/core/RoleManager";
import LawManager from "./data/model/core/LawManager";
import EventManager from "./data/model/core/EventManager";


let global = new Global();

Global.instance().metricsManager = new MetricsManager();

Global.instance().serverManager = new ServerManager();
Global.instance().socketManager = new SocketManager();
Global.instance().dbManager = new DbManager();
Global.instance().placeManager = new PlaceManager();
Global.instance().roleManager = new RoleManager();
Global.instance().lawManager = new LawManager();
Global.instance().eventManager = new EventManager();

Global.instance().serverManager.init();
