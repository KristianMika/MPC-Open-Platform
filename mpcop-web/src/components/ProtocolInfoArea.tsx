import { Grid, makeStyles, Typography } from "@material-ui/core";
import { cpuUsage } from "process";
import { useEffect, useState } from "react";
import { InfoSeverity } from "../constants/Constants";
import { IntroMessage } from "../constants/Intro";
import IProtocolInfoArea, {
	IProtocolInfo,
} from "../store/models/IProtocolInfoArea";
import { useProtocolSetupStyles } from "../styles/protocolSetup";
import { AutoHideAlert } from "./AutoHideAlert";

export const ProtocolInfoArea: React.FC<IProtocolInfoArea> = (props) => {
	const [alerts, setAlerts] = useState<JSX.Element[]>([]);

	useEffect(() => {
		if (props.messages.length > 0) {
			const message: IProtocolInfo | undefined = props.messages.pop();
			if (message) {
				setAlerts([
					...alerts,
					<AutoHideAlert key={message.timestamp} {...message}></AutoHideAlert>,
				]);
			}
		}
	}, [props]);

	//TODO: filter the hidden alerts and remove them from the page
	// useEffect(() => {
	// 	const relevant_alerts = alerts.filter((alert: JSX.Element) => {
	// 		console.log(alert.key);
	// 		console.log(Date.now() - (alert.key as number));
	// 		return Date.now() - (alert.key as number) < PROTOCOL_ALERT_VISIBILITY_TIME;
	// 	});
	// 	console.log(alerts.l)
	// 	setAlerts(relevant_alerts);
	// }, [alerts]);

	return <div data-intro={IntroMessage.PROTOCOL_INFO}>{alerts}</div>;
};
