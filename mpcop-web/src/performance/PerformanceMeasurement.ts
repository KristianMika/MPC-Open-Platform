import { CsvLines } from "../components/Ping";
import { pingPerformanceDataCsvHeader } from "../constants/Constants";
import { IPingMultiMeasurement } from "../store/models/IPingMultiMeasurement";
import { IProcessedMultiPingMeasurement } from "../store/models/IProcessedMultiPingMeasurement";
import { range, replicate } from "../utils/utils";

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

	toString(): string {
		return [
			this.computeLatency(),
			this.computeBackendRequestDuration(),
			this.computeBackendOperationDuration(),
			this.computeBackendResponseDuration(),
			this.computeLatency(),
		].join(",");
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

export interface ISpreadPerformanceData {
	players: number[];
	requestNetwork: number[];
	requestBackned: number[];
	javacards: number[];
	responseBackend: number[];
	responseNetwork: number[];
}
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
