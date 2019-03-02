"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Log {
    constructor(str, thing) {
        this.thing = thing;
        const line = str.split(";");
        this.id = line[1];
        this.tag = line[2];
        this.loglevel = line[3];
        this.message = line[4];
    }
}
exports.Log = Log;
