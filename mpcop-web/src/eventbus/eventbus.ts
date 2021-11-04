import { eventBus } from "../components/GlobalComponent";
import { CONTROLLER_ADDRESS } from "../constants/Constants";
import { IMessage } from "../store/models/IMessage";

export const send = (
	msgBody: IMessage,
	callback: any,
	logDebugMessage: any = null,
	stopLoading: any = null,
	storeLatency: any = null
) => {
	const originTimestamp = Date.now();
	eventBus.send(CONTROLLER_ADDRESS, msgBody, (_: any, msg: any) => {
		const operationDuration = Date.now() - originTimestamp;
		if (msg == null) {
			console.log("An error occured: the back-end hasn't responded");
		} else {
			const bodyJson = JSON.parse(msg.body);
			const rtt = operationDuration - Number(bodyJson.duration);
			if (storeLatency) {
				storeLatency(rtt / 2);
			}

			if (logDebugMessage) {
				logDebugMessage(bodyJson);
			}
			callback(bodyJson);
		}
		if (stopLoading) {
			stopLoading(false);
		}
	});
};
