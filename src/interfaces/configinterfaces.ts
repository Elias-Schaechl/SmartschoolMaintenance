export interface ConfigJson {
    title: string
    udp: Udp
    http: Http
    ws: Ws
}

interface Udp {
    broadcast_address: string
    broadcast_port: string
    port: string
    log_id: string
}

interface Http {
    port: string
}

interface Ws {
    port: string
}
