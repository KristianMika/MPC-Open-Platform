import EventBus from "@vertx/eventbus-bridge-client.js";
import { useRecoilState } from "recoil";
import { eventbusSocketState } from "../store/atom";

const host = window.location.hostname;
export const eventBus = new EventBus(`http://${host}:8082/mpcop-event-bus`);

/**
 * The global semi-component is an invisible component that is present
 * on every page. Its goal is to open and keep the connection with
 * the backend application
 * @returns nothing
 */
export const GlobalComponent: React.FC = () => {
	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);

	eventBus.enableReconnect(true);
	/**
	 * register callbacks that will set the global socket state
	 */
	eventBus.onclose = () => {
		setSocketState({ isOpen: false });
	};

	eventBus.onopen = () => {
		eventBus.registerHandler("service.controller-register");
		setSocketState({ isOpen: true });
	};

	return null;
};
