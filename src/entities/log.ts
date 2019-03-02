export class Log {
    public id: string
    public thing: string
    public tag: string
    public loglevel: string
    public message: string

    constructor(str: string, thing: string){
        this.thing = thing
        const line: string[] = str.split(";")
        this.id = line[1]
        this.tag = line[2]
        this.loglevel = line[3]
        this.message = line[4]

    }
}
