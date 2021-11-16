export class PerformanceMeasurement {
	public backend_ingress: number;
	public backend_egress: number;
	public operation_origin: number;
	public operation_done: number;
	public whole_operation_duration: number;

	constructor(
		backend_ingress: number,
		backend_egress: number,
		operation_origin: number,
		operation_done: number,
		whole_operation_duration: number
	) {
		this.backend_ingress = backend_ingress;
		this.backend_egress = backend_egress;
		this.operation_origin = operation_origin;
		this.operation_done = operation_done;
		this.whole_operation_duration = whole_operation_duration;
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

	computeRtt(): number {
		return (
			this.whole_operation_duration -
			(this.backend_egress - this.backend_ingress)
		);
	}

	computeLatency(): number {
		return this.computeRtt() / 2;
	}

	static fromHeaders(headers: any): PerformanceMeasurement {
		return new PerformanceMeasurement(
			headers.backend_ingress,
			headers.backend_egress,
			headers.operation_origin,
			headers.operation_done,
			headers.whole_operation_duration
		);
	}
}
