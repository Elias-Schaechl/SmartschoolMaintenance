export interface ConfigJson {
    title: string,
    local_broadcast_ip: string,
    udp: {
        broadcast_address: string,
        broadcast_port: number
    }
}
