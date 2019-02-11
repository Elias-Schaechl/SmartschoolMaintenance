export class SensorList {
    public static get Instance() {
        return this._instance || (this._instance = new this())
    }
    private static _instance: SensorList
    
}