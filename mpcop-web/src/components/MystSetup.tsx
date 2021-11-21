import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	Slider,
	Tooltip,
	Typography,
} from "@material-ui/core";
import { ChangeEvent, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
	COLOR_PRIMARY,
	InfoSeverity,
	LATENCY_MEASUREMENT_COUNT,
	Operation,
	Protocol,
} from "../constants/Constants";
import {
	defaultProtocolInfo,
	mystFormDefaultValues,
} from "../constants/DefaultValues";
import { IntroMessage } from "../constants/Intro";
import { OperationResult } from "../constants/Operation";
import { registerSubscribeHandler, send } from "../eventbus/eventbus";
import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";
import {
	debugMessagesState,
	eventbusSocketState,
	latencyState,
} from "../store/atom";
import { IMessage } from "../store/models/IMessage";
import { IMystFormValues } from "../store/models/IMystFormValues";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { IResponse } from "../store/models/IResponse";
import { useProtocolSetupStyles } from "../styles/protocolSetup";
import {
	appendDuration,
	checkResponseStatus,
	composeRequestInfoAlert,
	formatLog,
} from "../utils/utils";
import { eventBus } from "./GlobalComponent";
import { LoaderSpinner } from "./LoaderSpinner";
import { ProtocolInfoArea } from "./ProtocolInfoArea";

const mystVerticleAddress = "service.myst";
export const MystSetup: React.FC = () => {
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const handleDialogClose = () => {
		setIsDialogOpen(false);
	};
	const handleDialogOpen = () => {
		setIsDialogOpen(true);
	};
	const handleSliderChange = (name: string) => (_e: any, value: any) => {
		setFormValues({
			...formValues,
			[name]: value,
		});
	};
	const [formValues, setFormValues] = useState<IMystFormValues>(
		mystFormDefaultValues
	);
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);
	const [latencies, setLatencies] = useRecoilState(latencyState);
	const storeLatency = (latency: number) => {
		setLatencies({
			latencies: [
				...latencies.latencies.slice(-LATENCY_MEASUREMENT_COUNT + 1),
				latency,
			],
		});
	};
	const addDebugMessage = (severity: InfoSeverity, message: string) => {
		setProtocolInfo({
			messages: [
				...protocolInfo.messages,
				{ message, severity, timestamp: Date.now() },
			],
		});
	};
	const [loading, setLoading] = useState<boolean>(false);

	const {
		protocol_setup_form,
		protocol_form__setup_header,
		container_grid,
		protocol_setup__setup_button,
		protocol_form__slider,
	} = useProtocolSetupStyles();

	const received_response_log = () => {
		addDebugMessage(InfoSeverity.Info, `Received response`);
	};
	const handleResponseWithAlert = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement
	) => handleResponse(body, performanceMeasurement, true);
	const handleResponseWithoutAlert = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement
	) => handleResponse(body, performanceMeasurement, false);
	const handleResponse = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement | undefined,
		createAlert: boolean
	) => {
		setLoading(false);
		if (!checkResponseStatus(body) && createAlert) {
			addDebugMessage(InfoSeverity.Error, body.errMessage);
			return;
		}
		switch (body.operation) {
			case Operation.GetConfig:
				if (createAlert) {
					addDebugMessage(
						InfoSeverity.Success,
						"Updating the protocol configuration"
					);
				}
				setFormValues(JSON.parse(body.message));
				break;
			case Operation.Configure:
				if (createAlert) {
					addDebugMessage(
						InfoSeverity.Success,
						appendDuration(
							"The protocol has been configured successfully",
							performanceMeasurement
						)
					);
				}
				break;
		}
	};
	const handleSubmit = (event: ChangeEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);

		const configValues = {
			virtualCardsCount: formValues.virtualCardsCount,
		};

		const body: IMessage = {
			operation: Operation.Configure,
			data: JSON.stringify(configValues),
			protocol: Protocol.Myst,
		};
		addDebugMessage(InfoSeverity.Info, composeRequestInfoAlert("CONFIG"));
		send(
			body,
			mystVerticleAddress,
			handleResponseWithAlert,
			received_response_log,
			() => setLoading(false),
			storeLatency
		);
	};
	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);
	const logDebugMessage = (msg: IResponse) => {
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

		registerSubscribeHandler(
			`${mystVerticleAddress}-updates`,
			handleProtocolUpdate
		);

		const getConfigMessage: IMessage = {
			operation: Operation.GetConfig,
			data: "",
			protocol: Protocol.Myst,
		};

		send(
			getConfigMessage,
			mystVerticleAddress,
			handleResponseWithoutAlert,
			logDebugMessage,
			undefined,
			storeLatency
		);
	}, [socketState]);

	const handleProtocolUpdate = (body: IResponse) => {
		if (!checkResponseStatus(body)) {
			addDebugMessage(InfoSeverity.Error, body.errMessage);
			return;
		}
		switch (body.operation) {
			case Operation.GetConfig:
				addDebugMessage(
					InfoSeverity.Success,
					"Updating the protocol configuration"
				);
				setFormValues(JSON.parse(body.message));
				break;
		}
	};

	return (
		<div>
			<LoaderSpinner {...{ isVisible: loading, color: COLOR_PRIMARY }} />
			<form
				id="myst_setup_form"
				onSubmit={handleSubmit}
				className={protocol_setup_form}
				data-intro={IntroMessage.PROTOCOL_SETUP}
			>
				<Grid
					container
					alignItems="center"
					justifyContent="center"
					className={container_grid}
				>
					<Grid item xs={12} className={protocol_form__setup_header}>
						<Typography variant="h5" component="h1">
							Setup
						</Typography>
					</Grid>
					<Grid item xs={3}>
						<Typography id="discrete-slider-restrict" gutterBottom>
							Virtual cards:
						</Typography>
					</Grid>
					<Grid item xs={7}>
						<Tooltip title="Virtual cards are software-emulated cards that run directly on the server.">
							<Slider
								value={formValues.virtualCardsCount}
								onChange={handleSliderChange(
									"virtualCardsCount"
								)}
								step={1}
								min={0}
								max={15}
								className={protocol_form__slider}
								marks={[
									{
										value: 0,
										label: "0",
									},
									{
										value: 15,
										label: "15",
									},
								]}
								valueLabelDisplay="on"
							/>
						</Tooltip>
					</Grid>

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
									Modifying the protocol setup can reset the
									cards and erase all secrets!
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button onClick={handleDialogClose} autoFocus>
									Cancel
								</Button>
								<Button
									onClick={handleDialogClose}
									form="myst_setup_form"
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
		</div>
	);
};
