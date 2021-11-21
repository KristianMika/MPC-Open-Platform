import { useEffect, useState } from "react";
import { IntroMessage } from "../constants/Intro";
import IProtocolInfoArea, {
	IProtocolInfo,
} from "../store/models/IProtocolInfoArea";
import { AutoHideAlert } from "./AutoHideAlert";

/**
 * The protocol info area encapsulates information alerts into a single component
 * @param props - The input props
 */
export const ProtocolInfoArea: React.FC<IProtocolInfoArea> = (props) => {
	const [alerts, setAlerts] = useState<JSX.Element[]>([]);

	// add a new alert once the props have been updated
	useEffect(() => {
		if (props.messages.length > 0) {
			const message: IProtocolInfo | undefined = props.messages.pop();
			if (message) {
				setAlerts([
					...alerts,
					<AutoHideAlert
						key={message.timestamp}
						{...message}
					></AutoHideAlert>,
				]);
			}
		}
	}, [props]);

	return <div data-intro={IntroMessage.PROTOCOL_INFO}>{alerts}</div>;
};
