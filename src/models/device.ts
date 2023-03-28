interface DaylightProps {
    nextDark: number,
    nextLight: number,
    nextSunrise: number,
    nextSunset: number,
    status: string
}

interface DeviceProps { 
    assistedLiving: object,
    capabilities: string[],
    connection: string,
    daylight: DaylightProps,
    hardwireIdentifier: string,
    homekit: object,
    ipAddress: string,
    macAddress: string,
    manufacturer: string,
    mimicMode: mimicProps,
    model: string,
    online: boolean,
    operation: object,
    pmz: string,
    power: string,
    upgrade: object,
    uptime: number,
    version: string,
}

interface mimicProps {
    consumers: object[],
    enabled: boolean,
    end: string,
    firstTime: boolean,
    start: string
}

export interface IDevice {
    id: string,
    type: string,
    sortOrder: number,
    created: string,
    lastSeen: string,
    parent: string,
    props: DeviceProps,
    state: {
        name: string,
        homeKitEnabled: boolean,
        homeKitPaired: boolean,
        discovery: boolean
    }
}