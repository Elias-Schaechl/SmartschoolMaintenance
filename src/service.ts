import { ConfigHandler } from "./config/config"
import { setup as setupSensorMonitoringController } from "./controllers/sensormonitoringcontroller"

console.log("Starting SmartSchoolMaintenace")
ConfigHandler.Initialize()
setupSensorMonitoringController()
