
import { eventBus } from "../components/GlobalComponent";
import { CONTROLLER_ADDRESS } from "../constants/Constants";
import { IMessage } from "../store/models/IMessage";

export const send = (
	msgBody: IMessage,
	callback: any,
	logDebugMessage: any = null,
	stopLoading: any = null
) => {
	eventBus.send(CONTROLLER_ADDRESS, msgBody, (_: any, msg: any) => {
		if (msg == null) {
			console.log("An error occured: the back-end hasn't responded");
		} else {
			
			let bodyJson = JSON.parse(msg.body);
			if (logDebugMessage) {
				logDebugMessage(bodyJson);
			}
			callback(bodyJson);
		}
		if (stopLoading) {
			stopLoading(false)
		}
	});
};
