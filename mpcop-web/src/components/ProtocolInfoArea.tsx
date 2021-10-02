import { makeStyles } from "@material-ui/styles";
import { Alert } from "@mui/material";
import { IntroMessage } from "../constants/Intro";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";

// TODO: https://mui.com/components/alert/

export const ProtocolInfoArea: React.FC<IProtocolInfoArea> = (props) => {
	const infoBanner =
		props.message != null ? (
			<Alert severity={props.severity} data-intro={IntroMessage.PROTOCOL_INFO}>{props.message}</Alert>
		) : null;
	//const { protocol_form__error, protocol_form__info } = useStyles();
	return (
		<div>
			{infoBanner}
			{/* <Alert severity="success">{props.info}</Alert>
			<div className={protocol_form__error}>{props.error} </div>
			<div className={protocol_form__info}>{props.info} </div> */}
		</div>
	);
};
