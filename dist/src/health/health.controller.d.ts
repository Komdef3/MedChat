export interface HealthResponse {
    status: 'ok';
    timestamp: string;
}
export declare class HealthController {
    getHealth(): HealthResponse;
}
