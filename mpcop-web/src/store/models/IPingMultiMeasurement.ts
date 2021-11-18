import { PerformanceMeasurement } from "../../performance/PerformanceMeasurement";

export interface IPingMultiMeasurement {
	performanceMeasurement: PerformanceMeasurement;
	javaCardMeasurements: number[];
}
