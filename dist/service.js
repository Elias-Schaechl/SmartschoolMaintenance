"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config/config");
const sensormonitoringcontroller_1 = require("./controllers/sensormonitoringcontroller");
console.log("Starting SmartSchoolMaintenace");
config_1.ConfigHandler.Initialize();
sensormonitoringcontroller_1.setup();
