import { pingPerformanceDataCsvHeader } from "../constants/Constants";
import { CsvLines } from "../constants/Types";
import { IPingMultiMeasurement } from "../store/models/IPingMultiMeasurement";
import { IProcessedMultiPingMeasurement } from "../store/models/IProcessedMultiPingMeasurement";
import { ISpreadPerformanceData } from "../store/models/ISpreadPerformanceData";
import { add, divide, range, replicate } from "../utils/utils";

/**
 * The `PerformanceMeasurement` class encapsulates timestamps of specific request milestones
 */
export class PerformanceMeasurement {
	// the moment of the request reception by the application
	public backend_ingress: number;
	// the moment of response exiting the application
	public backend_egress: number;
	// the moment of the beginning of the request operation execution
	public operation_origin: number;
	// the moment when the operation execution has finished
	public operation_done: number;
	// the whole operation duration from the moment the request
	// has left the front-end to the moment of the response reception
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

	/**
	 * Computes the request duration between the backend entrance and the request execution
	 * @returns duration in ms
	 */
	computeBackendRequestDuration(): number {
		return this.operation_origin - this.backend_ingress;
	}

	/**
	 * Computes the response duration between the request execution
	 * has been finished and the backend exit
	 * @returns duration in ms
	 */
	computeBackendResponseDuration(): number {
		return this.backend_egress - this.operation_done;
	}

	/**
	 * Computes the duration of the requested operation execution
	 * @returns duration in ms
	 */
	computeBackendOperationDuration(): number {
		return this.operation_done - this.operation_origin;
	}

	/**
	 * Computes the network round trip time
	 * @returns rtt in ms
	 */
	computeRtt(): number {
		return (
			this.whole_operation_duration -
			(this.backend_egress - this.backend_ingress)
		);
	}

	/**
	 * Computes the network latency.
	 * Since the only way to compute the precise request or response latency
	 * is to synchronize the time with the backend application, latency is computed
	 * as rtt / 2
	 * @returns approximated network latency in ms
	 */
	computeLatency(): number {
		return this.computeRtt() / 2;
	}

	/**
	 * Stringifies this object
	 * @returns this object as a csv string
	 */
	toString(): string {
		return [
			this.computeLatency(),
			this.computeBackendRequestDuration(),
			this.computeBackendOperationDuration(),
			this.computeBackendResponseDuration(),
			this.computeLatency(),
		].join(",");
	}

	/**
	 * Build an instance of `PerformanceMeasurement` from vertx message headers that contain timestamps
	 * @param headers - Vertx response headers with timestamps
	 * @returns a new instance of `PerformanceMeasurement`
	 */
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

export const toCsv = (
	data: ISpreadPerformanceData
): (number[] | string[])[] => {
	const results: CsvLines = [pingPerformanceDataCsvHeader];
	for (let round = 0; round < data.players.length; round++) {
		const roundTimes = [
			data.players[round],
			data.requestNetwork[round],
			data.requestBackned[round],
			data.javacards[round],
			data.responseBackend[round],
			data.responseNetwork[round],
		];
		results.push(roundTimes);
	}

	return results;
};

export const spreadPerfData = (
	performanceMeasurement: IProcessedMultiPingMeasurement
): ISpreadPerformanceData => {
	const playersCount = performanceMeasurement.javaCardTimes.length;
	return {
		players: range(playersCount),
		requestNetwork: replicate(
			performanceMeasurement.requestNetwork,
			playersCount
		),
		requestBackned: replicate(
			performanceMeasurement.requestBackend,
			playersCount
		),
		javacards: performanceMeasurement.javaCardTimes,
		responseBackend: replicate(
			performanceMeasurement.responseBackend,
			playersCount
		),
		responseNetwork: replicate(
			performanceMeasurement.requestNetwork,
			playersCount
		),
	};
};
export const preparePlottingData = (perfData: ISpreadPerformanceData) => {
	return {
		labels: perfData.players,
		datasets: [
			{
				label: "Network (Request)",
				data: perfData.requestNetwork,
				backgroundColor: "#264653",
			},
			{
				label: "Backend App (Request)",
				data: perfData.requestBackned,
				backgroundColor: "#e9c46a",
			},
			{
				label: "JavaCard",
				data: perfData.javacards,
				backgroundColor: "#2a9d8f",
			},
			{
				label: "Backend App (Response)",
				data: perfData.responseBackend,
				backgroundColor: "#e9c46a",
			},
			{
				label: "Network (Response)",
				data: perfData.responseNetwork,
				backgroundColor: "#264653",
			},
		],
	};
};

export const processPingMultiMeasurement = (
	measurement: IPingMultiMeasurement
): IProcessedMultiPingMeasurement => {
	return {
		requestNetwork: measurement.performanceMeasurement.computeLatency(),
		requestBackend:
			measurement.performanceMeasurement.computeBackendRequestDuration(),
		javaCardTimes: measurement.javaCardMeasurements,
		responseBackend:
			measurement.performanceMeasurement.computeBackendResponseDuration(),
		responseNetwork: measurement.performanceMeasurement.computeLatency(),
	};
};

export const computeAverageMeasurement = (
	measurements: IPingMultiMeasurement[]
) => {
	const processedMeasurements: IProcessedMultiPingMeasurement[] = [];
	let averageMeasurement: IProcessedMultiPingMeasurement | null = null;
	for (const measurement of measurements) {
		const processedMeasurement = processPingMultiMeasurement(measurement);
		processedMeasurements.push(processedMeasurement);
		if (!averageMeasurement) {
			averageMeasurement = processedMeasurement;
		} else {
			averageMeasurement = add(averageMeasurement, processedMeasurement);
		}
	}
	if (averageMeasurement != null) {
		averageMeasurement = divide(
			averageMeasurement,
			processedMeasurements.length
		);
	}

	return averageMeasurement;
};
