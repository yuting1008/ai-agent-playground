export type TrafficData = {
    prompt: string;
    b64_json: string;
}

export type TrafficDataAction = {
    type: 'add' | 'change' | 'delete';
    trafficData: TrafficData;
}
