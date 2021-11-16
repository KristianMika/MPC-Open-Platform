import { eventBus } from "../components/GlobalComponent";
import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";
import { IMessage } from "../store/models/IMessage";
import { IPingMessage } from "../store/models/IPingMessage";
import { IResponse } from "../store/models/IResponse";

export const send = (
	msgBody: IMessage | IPingMessage,
	address: string,
	callback: (
		body: IResponse,
		performanceData: PerformanceMeasurement
	) => void,
	logDebugMessage: undefined | ((body: IResponse) => void) = undefined,
	stopLoading: undefined | (() => void) = undefined,
	storeLatency: undefined | ((latency: number) => void) = undefined
): void => {
	const originTimestamp = Date.now();
	eventBus.send(address, msgBody, (error: Error, msg: any) => {
		const operationDuration = Date.now() - originTimestamp;
		if (msg == null) {
			console.log("An error occured: the back-end hasn't responded");
		} else {
			msg.headers["whole_operation_duration"] = operationDuration;
			const performanceData = PerformanceMeasurement.fromHeaders(
				msg.headers
			);

			if (storeLatency) {
				storeLatency(performanceData.computeLatency());
			}

			if (logDebugMessage) {
				logDebugMessage(msg.body);
			}
			callback(msg.body, performanceData);
		}
		if (stopLoading) {
			stopLoading();
		}
	});
};
