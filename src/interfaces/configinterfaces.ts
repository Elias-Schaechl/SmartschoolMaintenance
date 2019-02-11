export interface ConfigJson {
    title: string,
    local_ip: string,
    udp: {
        broadcast_address: string,
        broadcast_port: number
    }
}
