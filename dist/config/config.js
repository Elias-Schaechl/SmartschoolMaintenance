"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const ip_1 = __importDefault(require("ip"));
class ConfigHandler {
    constructor() {
        this.path = "config.json";
        const rawdata = fs_1.default.readFileSync(this.path);
        this.config = JSON.parse(rawdata.toString());
        this.config.local_broadcast_ip = ip_1.default.subnet(ip_1.default.address(), "255.255.255.240").broadcastAddress;
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
    static Initialize() {
        console.log("Initializing config");
        const instance = this.Instance;
    }
}
exports.ConfigHandler = ConfigHandler;
