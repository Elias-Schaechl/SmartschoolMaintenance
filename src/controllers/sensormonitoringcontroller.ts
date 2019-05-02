import cors = require("cors")
import dgram = require("dgram")
import express = require("express")
import request = require("request")
import Socket = require("simple-websocket")
import simpleWsServer = require("simple-websocket/server")
import { ConfigHandler } from "./../config/config"
import { Log } from "./../entities/log"
import { Thing } from "./../entities/thing"

const confgHandler = ConfigHandler.Instance
const uDPserver = dgram.createSocket("udp4")
const logId = "*LG"
const broadcastPort = +confgHandler.config.udp.broadcast_port
const uDPListenPort = +confgHandler.config.udp.port
const httpPort = confgHandler.config.http.port
const broadcastAddress = confgHandler.config.udp.broadcast_address
const httpServer = express()
const websocketPort = +confgHandler.config.ws.port
const websocketServer = new simpleWsServer({port: websocketPort})
const websocketClients: Socket[] = []
const thingList: Thing[] = []

let lastInitSent: number = 0

console.log("Local broadcast address: " + broadcastAddress)

export function setup() {
    console.log("SensorMonitoringControllerSetup ran")
    SetUpUDPServer()
    SetUpHttpServer()
    SetUpWsServer()
    SetUpUdpInitCycle()

}

function SetUpUdpInitCycle() {
    SendUDP(JSON.stringify(uDPListenPort), broadcastAddress, broadcastPort)
    setInterval(() => SendUDP(JSON.stringify(uDPListenPort), broadcastAddress, broadcastPort), 10000)
}

function SetUpHttpServer() {
    httpServer.use(cors())
    httpServer.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        next()
      })
    httpServer.get("/", (req, res) => {
        res.send("SensorMonitoring welcome message")
    })
    httpServer.get("/things", (req, res) => {
        SendUDP(JSON.stringify(uDPListenPort), broadcastAddress, broadcastPort)
        // console.log(thingList)
        console.log("http get/things")
        const thingListString = (JSON.stringify(thingList)).replace("\\", " ")
        res.header("Access-Control-Allow-Origin", "*")
        res.send(thingListString)
    })
    httpServer.get("/state", (req, res) => {
        const ip = req.query.ip
        // console.log(ip)
        console.log("http thing/state")
        req.pipe(
            request("http://" + ip + "/state", (error, response, body) => {
            console.log("error:", error)
        }))
        .pipe(res)
    })
    httpServer.get("/setconfig", (req, res) => {
        const ip = req.query.ip
        const key = req.query.key
        const value = req.query.value
        // console.log(ip)
        console.log("http thing/setconfig")
        req.pipe(
            request.get("http://" + ip + "/setconfig" + `?${ key }=${ value }`, (error, response, body) => {
            console.log("error:", error)
        }))
        .pipe(res)
    })
    httpServer.get("/reset", (req, res) => {
        const ip = req.query.ip
        // console.log(ip)
        console.log("http thing/reset")
        try {
            request("http://" + ip + "/reset", (error, response, body) => {
                console.log("error:", error)
            })
        } catch (error) {
            res.status(500)
        }
        res.send("done")
    })
    httpServer.get("/factory", (req, res) => {
        const ip = req.query.ip
        // console.log(ip)
        console.log("http thing/factoryreset")
        try {
            request("http://" + ip + "/factoryreset", (error, response, body) => {
                console.log("error:", error)
            })
        } catch (error) {
            res.status(500)
        }
        res.send("done")
    })
    // httpServer.use((err, req, res, next) => {
    //    console.error(err.stack);
    //    res.status(500).send('Something broke!');
    //  });

    httpServer.listen(httpPort, () => {
        console.log(`HttpServer listening at port ${httpPort}`)
    })
    // httpServer
}

function SetUpWsServer() {
    console.log(`WSServer listening at port ${websocketPort}`)
    websocketServer.on("connection", (socket) => {
        console.log("ws on.open")
        websocketClients.push(socket)
        socket.write("pong")
        socket.on("data", () => {console.log("ws on.data")})
        socket.on("close", () => {
            console.log("ws on.close")
            const index = websocketClients.indexOf(socket)
            websocketClients.splice(index)
        })
        socket.on("error", () => {console.log("ws on.error")})
        socket.send("Connected to SensorMonitoringService")
    })
}

function SendWsMessage(message: string) {
    // console.log(websocketClients)

    if (websocketClients !== undefined) {
        websocketClients.forEach((client) => {
            // console.log(message)
            if (client !== undefined) {
                client.send(message)
            }
        })
    }
}

function SendUDP(message: string, address: string, port: number) {
    const client = dgram.createSocket("udp4")
    lastInitSent = Date.now()
    client.send(message, port, address, (err) => {
        client.close()
    })
}

function StartsWith(base: string, check: string) {
    for (let i = 0; i < check.length; i++) {
        if (base.charAt(i) !== check.charAt(i)) {
            return false
        }
    }
    return true
}

function AddOrUpdateThingInList(newThing: Thing) {
    for (const thing of thingList) {
        if (thing.ip === newThing.ip) {
            thingList.splice(thingList.indexOf(thing))
        }
    }
    thingList.push(newThing)
    return true
}

function SetUpUDPServer() {
    uDPserver.on("error", (err) => {
        console.log(`server error:\n${err.stack}`)
        uDPserver.close()
      })
    uDPserver.on("message", (msg, rinfo) => {
        console.log(`${msg} from ${rinfo.address}:${rinfo.port}`)
        const receiveTime = Date.now()
        if (StartsWith(msg.toString("utf8"), logId)) {

            const log: Log = new Log(msg.toString("utf8"), GetThingByIp(rinfo.address))
            SendWsMessage(JSON.stringify(log))
        } else {
            try {
                const thing: Thing = JSON.parse(msg.toString())
                thing.ip = rinfo.address
                thing.lrtime = receiveTime
                thing.ping = receiveTime - lastInitSent
                AddOrUpdateThingInList(thing)
            } catch (error) {
                console.log("UDP message not valid!")
            }
            // console.log(thingList)
        }

      })
    uDPserver.on("listening", () => {
        const address = uDPserver.address()
        console.log(`UdpServer listening at port ${JSON.parse(JSON.stringify(address)).port}`)
      })
    uDPserver.bind(uDPListenPort)
}

function GetThingByIp(ip: string) {
    for (const thing of thingList) {
        if (thing.ip === ip) {
            return thing.thing
        }
    }
    return "oo"
}
