class SensorData{

    public readonly thing: string
    public readonly actor: string[]
    public readonly sensor: string
    public readonly ip: string

    constructor( thing: string, actor: string[], sensor: string, ip: string) {
        this.thing = thing
        this.actor = actor
        this.sensor = sensor
        this.ip = ip
    }
}
