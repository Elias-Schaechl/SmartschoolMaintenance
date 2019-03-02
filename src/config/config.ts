import fs from "fs"
import ip from "ip"
import { ConfigJson } from "../interfaces/configinterfaces"

export class ConfigHandler {

    public static get Instance() {
        return this._instance || (this._instance = new this())
    }

    public static Initialize() {
        console.log("Initializing config")
        const instance = this.Instance
    }

    private static _instance: ConfigHandler
    public readonly config: ConfigJson
    private path: string = "config.json"

    private constructor() {
        const rawdata = fs.readFileSync(this.path)
        this.config = JSON.parse(rawdata.toString())
        this.config.local_broadcast_ip = ip.subnet(ip.address(), "255.255.255.240").broadcastAddress
    }
}
