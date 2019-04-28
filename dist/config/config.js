"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class ConfigHandler {
    constructor() {
        this.path = "config.json";
        const rawdata = fs_1.default.readFileSync(this.path);
        this.config = JSON.parse(rawdata.toString());
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
