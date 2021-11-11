import EventBus from "@vertx/eventbus-bridge-client.js";
import { useRecoilState } from "recoil";
import { eventbusSocketState } from "../store/atom";

const host = window.location.hostname;
export const eventBus = new EventBus(`http://${host}:8082/mpcop-event-bus`);

export const GlobalComponent: React.FC = () => {

	eventBus.enableReconnect(true);
	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);
	eventBus.onclose = () => {
		setSocketState({ isOpen: false });
	};
	eventBus.onopen = function () {
		eventBus.registerHandler(
			"service.controller-register"
		);
		setSocketState({ isOpen: true });
	};
	return null;
};
