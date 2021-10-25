import { Alert } from "@mui/material";
import { IntroMessage } from "../constants/Intro";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";

export const ProtocolInfoArea: React.FC<IProtocolInfoArea> = (props) => {
	const infoBanner =
		props.message != null ? (
			<Alert
				severity={props.severity}
				data-intro={IntroMessage.PROTOCOL_INFO}
			>
				{props.message}
			</Alert>
		) : null;
	return <div>{infoBanner}</div>;
};
