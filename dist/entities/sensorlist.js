"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SensorList {
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
exports.SensorList = SensorList;
