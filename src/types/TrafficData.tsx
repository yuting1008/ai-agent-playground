export type TrafficData = {
    connectionLatency: number[];
    connectionLatencyAvg: number;
    connectionLatencyMin: number;
    connectionLatencyMax: number;
}

export type TrafficDataAction = {
    type: 'add' | 'change' | 'delete';
    trafficData: TrafficData;
}
