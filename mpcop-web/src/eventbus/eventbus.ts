import { eventBus } from "../components/GlobalComponent";
import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";
import { IMessage } from "../store/models/IMessage";
import { IPingMessage } from "../store/models/IPingMessage";
import { IResponse } from "../store/models/IResponse";

/**
 * The send function sends a message to the specified address using the request/reply messaging.
 * The response is then passed to the callback function along with performance measurement
 * @param msgBody - The message to be sent
 * @param address - Where to send it
 * @param callback - The callback used to handle the reponse message
 * @param logDebugMessage - If provided, it is used for logging reception of a response
 * @param stopLoading - if provided, a callback function that hides the loaded spinner
 * @param storeLatency - if provided, a function that stores a communication latency
 */
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

/**
 * Registers a subscribe handler to the specified address
 * @param address - The subscription address
 * @param handler - The message reception handler
 */
export const registerSubscribeHandler = (
	address: string,
	handler: (response: IResponse) => void
) => {
	eventBus.unregisterHandler(address);
	eventBus.registerHandler(
		address,
		undefined,
		(error: Error, msg: any): void => {
			handler(msg.body);
		}
	);
};
