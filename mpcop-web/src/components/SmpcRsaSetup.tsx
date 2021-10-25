import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	Switch,
	Tooltip,
	Typography,
} from "@material-ui/core";
import { InfoSeverity, Operation, Protocol } from "../constants/Constants";
import { IMessage } from "../store/models/IMessage";
import { useProtocolSetupStyles } from "../styles/protocolSetup";
import { send } from "../eventbus/eventbus";
import { useEffect, useState } from "react";
import { ProtocolInfoArea } from "./ProtocolInfoArea";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { IResponse } from "../store/models/IResponse";
import { useRecoilState } from "recoil";
import { debugMessagesState, eventbusSocketState } from "../store/atom";
import { IntroMessage } from "../constants/Intro";
import { formatLog, OperationResult } from "../utils/utils";

interface IFormValues {
	isServerSimulated: boolean;
	isClientSimulated: boolean;
}

const defaultFormValues: IFormValues = {
	isServerSimulated: false,
	isClientSimulated: false,
};
export const SmpcRsaSetup: React.FC = () => {
	const [formValues, setFormValues] =
		useState<IFormValues>(defaultFormValues);
	const defaultProtocolInfo: IProtocolInfoArea = {
		severity: InfoSeverity.Info,
		message: null,
	};
	const {
		protocol_setup_form,
		protocol_form__setup_header,
		container_grid,
		protocol_setup__setup_button,
		protocol_form__switch_grid,
		protocol_form__switch_label_grid,
	} = useProtocolSetupStyles();
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);

	const handleResponse = (body: IResponse) => {
		switch (body.operation) {
			case Operation.GetConfig:
				setFormValues(JSON.parse(body.message));
				break;

			default:
				if (body.success) {
					setProtocolInfo({
						severity: InfoSeverity.Success,
						message: body.message,
					});
				} else {
					setProtocolInfo({
						severity: InfoSeverity.Error,
						message: body.errMessage,
					});
				}
		}
	};
	const handleSubmit = (event: any) => {
		event.preventDefault();

		setProtocolInfo(defaultProtocolInfo);
		if (formValues.isClientSimulated && formValues.isServerSimulated) {
			setProtocolInfo({
				severity: InfoSeverity.Warning,
				message: "The server and the client can't be both simulated",
			});
			return;
		}

		const body: IMessage = {
			operation: Operation.Configure,
			data: JSON.stringify(formValues),
			protocol: Protocol.SmartIdRsa,
		};

		send(body, handleResponse);
	};

	const eventSwitchChange = (e: any) => {
		setFormValues({
			...formValues,
			[e.target.name]: e.target.checked,
		});
	};

	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const handleDialogClose = () => {
		setIsDialogOpen(false);
	};
	const handleDialogOpen = () => {
		setIsDialogOpen(true);
	};

	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);
	const logDebugMessage = (msg: any) => {
		const res = msg.success ? OperationResult.Success : OperationResult.Error;

		const prevMessages = debugMessages.messages;
		setDebugMessages({
			messages: prevMessages.concat([
				formatLog(res, JSON.stringify(msg), "Myst"),
			]),
		});
	};
	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);
	useEffect(() => {
		if (!socketState.isOpen) {
			return;
		}
		const getConfigMessage: IMessage = {
			operation: Operation.GetConfig,
			data: "",
			protocol: Protocol.SmartIdRsa,
		};

		send(getConfigMessage, handleResponse, logDebugMessage);
	}, [socketState]);

	console.log(formValues);
	return (
		<form
			id="smpcrsa_setup_form"
			onSubmit={handleSubmit}
			className={protocol_setup_form}
			data-intro={IntroMessage.PROTOCOL_SETUP}
		>
			<Grid
				container
				alignItems="center"
				justify="center"
				className={container_grid}
			>
				<Grid item xs={12} className={protocol_form__setup_header}>
					<Typography variant="h5" component="h1">
						Setup
					</Typography>
				</Grid>
				<Grid item xs={6} className={protocol_form__switch_label_grid}>
					<Typography gutterBottom>Emulate server:</Typography>
				</Grid>
				<Grid item xs={6} className={protocol_form__switch_grid}>
					<Tooltip title="The server will run in an emulated card.">
						<Switch
							checked={formValues.isServerSimulated}
							name="isServerSimulated"
							onChange={eventSwitchChange}
							color="primary"
						/>
					</Tooltip>
				</Grid>
				<Grid item xs={6} className={protocol_form__switch_label_grid}>
					<Typography gutterBottom>Emulate client:</Typography>
				</Grid>

				<Grid item xs={6} className={protocol_form__switch_grid}>
					<Tooltip title="The client will run in an emulated card.">
						<Switch
							checked={formValues.isClientSimulated}
							name="isClientSimulated"
							onChange={eventSwitchChange}
							color="primary"
						/>
					</Tooltip>
				</Grid>
				<Grid item xs={7}></Grid>

				<Grid item xs={12} className={protocol_setup__setup_button}>
					<Tooltip title="Update the protocol's configuration.">
						<Button
							variant="contained"
							color="primary"
							onClick={handleDialogOpen}
						>
							Setup
						</Button>
					</Tooltip>
					<Dialog
						open={isDialogOpen}
						onClose={handleDialogClose}
						aria-labelledby="alert-dialog-title"
						aria-describedby="alert-dialog-description"
					>
						<DialogTitle id="alert-dialog-title">
							{"Are you sure?"}
						</DialogTitle>
						<DialogContent>
							<DialogContentText id="alert-dialog-description">
								Modifying the protocol setup can reset the cards
								and erase all secrets!
							</DialogContentText>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={handleDialogClose}
								color="primary"
								autoFocus
							>
								Cancel
							</Button>
							<Button
								onClick={handleDialogClose}
								form="smpcrsa_setup_form"
								type="submit"
							>
								Proceed
							</Button>
						</DialogActions>
					</Dialog>
				</Grid>
				<Grid item xs={12}>
					<ProtocolInfoArea {...protocolInfo} />
				</Grid>
			</Grid>
		</form>
	);
};
