export class Thing {
    public thing: string
    public actor: string
    public sensor: string
    public loglevel: number
    public ip: string
    constructor(src: string) {
        this.thing = ""
        this.actor = ""
        this.sensor = ""
        this.loglevel = 0
        this.ip = ""
    }

}
