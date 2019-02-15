"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dgram = require("dgram");
const express = require("express");
const config_1 = require("./../config/config");
const confgHandler = config_1.ConfigHandler.Instance;
const uDPserver = dgram.createSocket("udp4");
const httpServer = express();
//const broadcastAddress = confgHandler.config.udp.broadcast_address
//const broadcastPort = confgHandler.config.udp.broadcast_port
//const broadcastAddress = "127.0.0.255"
const broadcastAddress = "17.0.0.255";
const broadcastPort = 45678;
const httpPort = 3000;
const localIP = confgHandler.config.local_ip;
console.log(localIP);
function setup() {
    SendUDP("41234", broadcastAddress, broadcastPort);
    SetUpUDPServer();
    SetUpHttpServer();
    setInterval(() => SendUDP("41234", broadcastAddress, broadcastPort), 15000);
    console.log("SensorMonitoringControllerSetup finished!!");
}
exports.setup = setup;
function SetUpHttpServer() {
    httpServer.get("/", (req, res) => {
        res.send("SensorMonitoring welcome message");
    });
    httpServer.get("/things", (req, res) => {
        res.send("SensorMonitoring thing list");
    });
    httpServer.listen(httpPort, () => {
        console.log(`HttpServer listening at port ${httpPort}!`);
    });
}
function SendUDP(message, address, port) {
    const client = dgram.createSocket("udp4");
    //const buffer = Buffer.from(message)
    client.send(message, port, address, (err) => {
        client.close();
    });
}
function SetUpUDPServer() {
    uDPserver.on("error", (err) => {
        console.log(`server error:\n${err.stack}`);
        uDPserver.close();
        //uDPserver.
    });
    uDPserver.on("message", (msg, rinfo) => {
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        try {
            JSON.stringify(msg.toString("utf8"));
        }
        catch (error) {
            console.log("Udp message not valid!");
        }
    });
    uDPserver.on("listening", () => {
        const address = uDPserver.address();
        console.log(`server listening ${JSON.stringify(address)}`);
    });
    uDPserver.bind(41234);
}
