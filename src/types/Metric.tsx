export type Metric = {
    firstTokenLatencyMin: string | number;
    firstTokenLatencyMax: string | number;
    firstTokenLatencyAvg: string | number;
    firstTokenLatencyP50: string | number;
    firstTokenLatencyP90: string | number;
    firstTokenLatencyP95: string | number;
    firstTokenLatencyP99: string | number;
    firstTokenLatencyLast: string | number;

    tokenLatencyMin: string | number;
    tokenLatencyMax: string | number;
    tokenLatencyAvg: string | number;
    tokenLatencyP50: string | number;
    tokenLatencyP90: string | number;
    tokenLatencyP95: string | number;
    tokenLatencyP99: string | number;
    tokenLatencyLast: string | number;
}
