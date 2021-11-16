import { IAppPerformanceTimestamps } from "../store/models/IAppPerformanceTimestamps";

export class PerformanceMeasurement implements IAppPerformanceTimestamps {
	public backend_ingress: number;
	public backend_egress: number;
	public operation_origin: number;
	public operation_done: number;

	constructor(
		backend_ingress: number,
		backend_egress: number,
		operation_origin: number,
		operation_done: number
	) {
		this.backend_ingress = backend_ingress;
		this.backend_egress = backend_egress;
		this.operation_origin = operation_origin;
		this.operation_done = operation_done;
	}

	computeBackendRequestDuration(): number {
		return this.operation_origin - this.backend_ingress;
	}

	computeBackendResponseDuration(): number {
		return this.backend_egress - this.operation_done;
	}

	computeBackendOperationDuration(): number {
		return this.operation_done - this.operation_origin;
	}

	static fromHeaders(headers: any): PerformanceMeasurement {
		return new PerformanceMeasurement(
			headers.backend_ingress,
			headers.backend_egress,
			headers.operation_origin,
			headers.operation_done
		);
	}
}
