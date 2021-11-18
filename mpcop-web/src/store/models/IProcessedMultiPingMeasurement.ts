export interface IProcessedMultiPingMeasurement {
	requestNetwork: number;
	requestBackend: number;
	javaCardTimes: number[];
	responseBackend: number;
	responseNetwork: number;
}
