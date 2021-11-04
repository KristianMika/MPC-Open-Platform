import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	Grid,
	Switch,
	Tooltip,
	Typography,
} from "@material-ui/core";
import {
	InfoSeverity,
	LATENCY_MEASUREMENT_COUNT,
	Operation,
	Protocol,
} from "../constants/Constants";
import { IMessage } from "../store/models/IMessage";
import { useProtocolSetupStyles } from "../styles/protocolSetup";
import { send } from "../eventbus/eventbus";
import { useEffect, useState } from "react";
import { ProtocolInfoArea } from "./ProtocolInfoArea";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { IResponse } from "../store/models/IResponse";
import { useRecoilState } from "recoil";
import {
	debugMessagesState,
	eventbusSocketState,
	latencyState,
} from "../store/atom";
import { IntroMessage } from "../constants/Intro";
import {
	checkResponseStatus,
	composeRequestInfoAlert,
	formatLog,
	OperationResult,
} from "../utils/utils";
import { defaultProtocolInfo } from "../constants/DefaultValues";

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

	const {
		protocol_setup_form,
		protocol_form__setup_header,
		container_grid,
		protocol_setup__setup_button,
		protocol_form__switch_label_grid,
	} = useProtocolSetupStyles();
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);

	const addDebugMessage = (severity: InfoSeverity, message: string) => {
		setProtocolInfo({
			messages: [
				...protocolInfo.messages,
				{ message, severity, key: Date.now() },
			],
		});
	};
	const [latencies, setLatencies] = useRecoilState(latencyState);
	const storeLatency = (latency: number) => {
		setLatencies({
			latencies: [
				...latencies.latencies.slice(-LATENCY_MEASUREMENT_COUNT + 1),
				latency,
			],
		});
	};
	const received_response_log = () => {
		addDebugMessage(InfoSeverity.Info, `Received response`);
	};

	const handleResponse = (body: IResponse) => {
		if (!checkResponseStatus(body)) {
			addDebugMessage(InfoSeverity.Error, body.errMessage);
			return;
		}

		switch (body.operation) {
			case Operation.GetConfig:
				setFormValues(JSON.parse(body.message));
				break;
			case Operation.Configure:
				addDebugMessage(
					InfoSeverity.Success,
					`The protocol has been successully configured`
				);
				break;

			default:
				if (body.success) {
					addDebugMessage(InfoSeverity.Success, body.message);
				} else {
					addDebugMessage(InfoSeverity.Error, body.errMessage);
				}
		}
	};
	const handleSubmit = (event: any) => {
		event.preventDefault();

		if (formValues.isClientSimulated && formValues.isServerSimulated) {
			addDebugMessage(
				InfoSeverity.Warning,
				"The server and the client can't be both simulated"
			);
			return;
		}

		const body: IMessage = {
			operation: Operation.Configure,
			data: JSON.stringify(formValues),
			protocol: Protocol.SmartIdRsa,
		};

		addDebugMessage(InfoSeverity.Info, composeRequestInfoAlert("CONFIG"));

		send(body, handleResponse, received_response_log, null, storeLatency);
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
		const res = msg.success
			? OperationResult.Success
			: OperationResult.Error;

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

		send(
			getConfigMessage,
			handleResponse,
			logDebugMessage,
			null,
			storeLatency
		);
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
				<Grid item xs={10} className={protocol_form__switch_label_grid}>
					<Tooltip title="The server will run in an emulated card.">
						<FormControlLabel
							control={
								<Switch
									checked={formValues.isServerSimulated}
									name="isServerSimulated"
									onChange={eventSwitchChange}
									color="primary"
								/>
							}
							label="Emulate server"
							labelPlacement="start"
						/>
					</Tooltip>
				</Grid>

				<Grid item xs={10} className={protocol_form__switch_label_grid}>
					<Tooltip title="The client will run in an emulated card.">
						<FormControlLabel
							control={
								<Switch
									checked={formValues.isClientSimulated}
									name="isClientSimulated"
									onChange={eventSwitchChange}
									color="primary"
								/>
							}
							label="Emulate client"
							labelPlacement="start"
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
