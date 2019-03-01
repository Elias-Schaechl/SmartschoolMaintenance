import { Thing } from './../entities/thing';
import dgram = require("dgram")
import express = require("express")
import Socket = require("simple-websocket")
import simpleWsServer = require("simple-websocket/server")
import { ConfigHandler } from "./../config/config"

const confgHandler = ConfigHandler.Instance
const uDPserver = dgram.createSocket("udp4")
const httpServer = express()
const websocketServer = new simpleWsServer({port: 8080})
const websocketClients: Socket[] = []
const thingList: Thing[] = []

// const broadcastAddress = confgHandler.config.udp.broadcast_address
// const broadcastPort = confgHandler.config.udp.broadcast_port
// const broadcastAddress = "127.0.0.255"
const logId = "*LG"
const broadcastAddress = "192.168.0.255"
const broadcastPort = 4444
const uDPListenPort = 41234
const httpPort = 3000
const localIP = confgHandler.config.local_ip
console.log(localIP)

export function setup() {

    SetUpUDPServer()
    SetUpHttpServer()
    SetUpWsServer()
    // setInterval(() => SendUDP(JSON.stringify(uDPListenPort), broadcastAddress, broadcastPort), 15000)
    console.log("SensorMonitoringControllerSetup ran")
}

function SetUpHttpServer() {
    httpServer.get("/", (req, res) => {
        res.send("SensorMonitoring welcome message")
    })
    httpServer.get("/things", (req, res) => {
        SendUDP(JSON.stringify(uDPListenPort), broadcastAddress, broadcastPort)
        console.log(thingList)
        const thingListString = (JSON.stringify(thingList)).replace("\\", " ")
        res.send(thingListString)

    })
    httpServer.listen(httpPort, () => {
        console.log(`HttpServer listening at port ${httpPort}!`)
    })
}

function SetUpWsServer() {
    websocketServer.on("connection", (socket) => {
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

function CheckThingInList(checkThing: string) {
    thingList.forEach((thing) => {
        if (thing.thing === checkThing) {
            return true
        }

    })
    return false
}

function SetUpUDPServer() {
    uDPserver.on("error", (err) => {
        console.log(`server error:\n${err.stack}`)
        uDPserver.close()
        // uDPserver.
      })
    uDPserver.on("message", (msg, rinfo) => {
        // console.log(`${msg} from ${rinfo.address}:${rinfo.port}`)
        if (StartsWith(msg.toString("utf8"), logId)) {
            SendWsMessage(msg.toString("utf8"))
        } else {
            try {
                const thing = JSON.parse(msg.toString())
                if (!CheckThingInList(thing.thing)) {
                    thingList.push(thing)
                }
            } catch (error) {
                console.log("UDP message not valid!")
            }
            // console.log(thingList)
        }

      })
    uDPserver.on("listening", () => {
        const address = uDPserver.address()
        console.log(`server listening ${JSON.stringify(address)}`)
      })
    uDPserver.bind(uDPListenPort)
}
