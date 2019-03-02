"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dgram = require("dgram");
const express = require("express");
const simpleWsServer = require("simple-websocket/server");
const config_1 = require("./../config/config");
const log_1 = require("./../entities/log");
const confgHandler = config_1.ConfigHandler.Instance;
const uDPserver = dgram.createSocket("udp4");
const httpServer = express();
const websocketServer = new simpleWsServer({ port: 8080 });
const websocketClients = [];
const thingList = [];
// const broadcastAddress = confgHandler.config.udp.broadcast_address
// const broadcastPort = confgHandler.config.udp.broadcast_port
// const broadcastAddress = "127.0.0.255"
const logId = "*LG";
const broadcastPort = 4444;
const uDPListenPort = 41234;
const httpPort = 3000;
//const broadcastAddress = "192.168.0.255"
const broadcastAddress = "10.0.0.255";
//const broadcastAddress = confgHandler.config.local_broadcast_ip
console.log("Local broadcast address: " + broadcastAddress);
function setup() {
    SetUpUDPServer();
    SetUpHttpServer();
    SetUpWsServer();
    SetUpUdpInitCycle();
    console.log("SensorMonitoringControllerSetup ran");
}
exports.setup = setup;
function SetUpUdpInitCycle() {
    SendUDP(JSON.stringify(uDPListenPort), broadcastAddress, broadcastPort);
    setInterval(() => SendUDP(JSON.stringify(uDPListenPort), broadcastAddress, broadcastPort), 10000);
}
function SetUpHttpServer() {
    httpServer.get("/", (req, res) => {
        res.send("SensorMonitoring welcome message");
    });
    httpServer.get("/things", (req, res) => {
        SendUDP(JSON.stringify(uDPListenPort), broadcastAddress, broadcastPort);
        console.log(thingList);
        const thingListString = (JSON.stringify(thingList)).replace("\\", " ");
        res.send(thingListString);
    });
    httpServer.listen(httpPort, () => {
        console.log(`HttpServer listening at port ${httpPort}!`);
    });
}
function SetUpWsServer() {
    websocketServer.on("connection", (socket) => {
        websocketClients.push(socket);
        socket.write("pong");
        socket.on("data", () => { console.log("ws on.data"); });
        socket.on("close", () => {
            console.log("ws on.close");
            const index = websocketClients.indexOf(socket);
            websocketClients.splice(index);
        });
        socket.on("error", () => { console.log("ws on.error"); });
        socket.send("Connected to SensorMonitoringService");
    });
}
function SendWsMessage(message) {
    // console.log(websocketClients)
    if (websocketClients !== undefined) {
        websocketClients.forEach((client) => {
            // console.log(message)
            if (client !== undefined) {
                client.send(message);
            }
        });
    }
}
function SendUDP(message, address, port) {
    const client = dgram.createSocket("udp4");
    client.send(message, port, address, (err) => {
        client.close();
    });
}
function StartsWith(base, check) {
    for (let i = 0; i < check.length; i++) {
        if (base.charAt(i) !== check.charAt(i)) {
            return false;
        }
    }
    return true;
}
function CheckThingInList(checkThing) {
    for (const thing of thingList) {
        if (thing.thing === checkThing) {
            return true;
        }
    }
    return false;
}
function SetUpUDPServer() {
    uDPserver.on("error", (err) => {
        console.log(`server error:\n${err.stack}`);
        uDPserver.close();
        // uDPserver.
    });
    uDPserver.on("message", (msg, rinfo) => {
        // console.log(`${msg} from ${rinfo.address}:${rinfo.port}`)
        if (StartsWith(msg.toString("utf8"), logId)) {
            const log = new log_1.Log(msg.toString("utf8"), GetThingByIp(rinfo.address));
            SendWsMessage(JSON.stringify(log));
        }
        else {
            try {
                const thing = JSON.parse(msg.toString());
                thing.ip = rinfo.address;
                if (!CheckThingInList(thing.thing)) {
                    thingList.push(thing);
                }
            }
            catch (error) {
                console.log("UDP message not valid!");
            }
            // console.log(thingList)
        }
    });
    uDPserver.on("listening", () => {
        const address = uDPserver.address();
        console.log(`UdpServer listening ${JSON.stringify(address)}`);
    });
    uDPserver.bind(uDPListenPort);
}
function GetThingByIp(ip) {
    for (const thing of thingList) {
        if (thing.ip === ip) {
            return thing.thing;
        }
    }
    return "oo";
}
