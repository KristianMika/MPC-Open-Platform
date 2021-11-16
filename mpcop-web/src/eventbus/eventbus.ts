import { eventBus } from "../components/GlobalComponent";
import { IAppPerformanceTimestamps } from "../store/models/IAppPerformanceTimestamps";

import { IMessage } from "../store/models/IMessage";
import { IResponse } from "../store/models/IResponse";
import { computeRtt } from "../utils/utils";

export const send = (
	msgBody: IMessage,
	address: string,
	callback: (body: IResponse) => void,
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
			const performanceData: IAppPerformanceTimestamps = msg.headers;
			const rtt = computeRtt(operationDuration, performanceData);

			if (storeLatency) {
				storeLatency(rtt / 2);
			}

			if (logDebugMessage) {
				logDebugMessage(msg.body);
			}
			callback(msg.body);
		}
		if (stopLoading) {
			stopLoading();
		}
	});
};
