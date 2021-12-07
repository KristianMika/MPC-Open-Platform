import { Button, Grid, Slider, Tooltip, Typography } from "@material-ui/core";
import { ChangeEvent, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
	MYST_SERVICE_ADDRESS,
	MYST_SERVICE_UPDATES_ADDRESS,
} from "../constants/Addresses";
import {
	COLOR_PRIMARY,
	InfoSeverity,
	LATENCY_MEASUREMENT_COUNT,
	Operation,
	Protocol,
	protocolSetupUpdatesOperations,
} from "../constants/Constants";
import {
	defaultProtocolInfo,
	mystFormDefaultValues,
} from "../constants/DefaultValues";
import { IntroMessage } from "../constants/Intro";
import { OperationResult } from "../constants/Operation";
import { Origin } from "../constants/Origin";
import { registerSubscribeHandler, send } from "../eventbus/eventbus";
import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";
import {
	debugMessagesState,
	eventbusSocketState,
	latencyState,
} from "../store/atom";
import { IDebugMessages } from "../store/models/IDebugMessages";
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
import { ConfirmationDialog } from "./ConfirmationDialog";
import { LoaderSpinner } from "./LoaderSpinner";
import { ProtocolInfoArea } from "./ProtocolInfoArea";

/**
 * The myst setup components provides a user interface for Myst configuration.
 * It allows to choose the number of simulated players
 */
export const MystSetup: React.FC = () => {
	// states
	const [formValues, setFormValues] = useState<IMystFormValues>(
		mystFormDefaultValues
	);
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);
	const [latencies, setLatencies] = useRecoilState(latencyState);
	const [loading, setLoading] = useState<boolean>(false);
	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);

	const formId = "myst_setup_form";

	// Closes the confirmation dialog
	const handleDialogClose = () => {
		setIsDialogOpen(false);
	};

	// opens the confirmation dialog
	const handleDialogOpen = () => {
		setIsDialogOpen(true);
	};

	const {
		protocol_setup_form,
		protocol_form__setup_header,
		container_grid,
		protocol_setup__setup_button,
		protocol_form__slider,
	} = useProtocolSetupStyles();

	/**
	 * Stores the new value from the slider into the form state
	 * @param name
	 * @returns
	 */
	const handleSliderChange = (name: string) => (_e: any, value: any) => {
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	/**
	 * Stores a request network latency
	 * @param latency - Latency in ms to be stored
	 */
	const storeLatency = (latency: number) => {
		setLatencies({
			latencies: [
				...latencies.latencies.slice(-LATENCY_MEASUREMENT_COUNT + 1),
				latency,
			],
		});
	};

	/**
	 * Creates an information alert
	 * @param severity - The severity of the alert
	 * @param message - The message that will be diplayed
	 */
	const addInformationAlert = (severity: InfoSeverity, message: string) => {
		setProtocolInfo({
			messages: [
				...protocolInfo.messages,
				{ message, severity, timestamp: Date.now() },
			],
		});
	};

	// creates an information alert informing the response has been recieved
	const informAboutReceivedResponse = () => {
		addInformationAlert(InfoSeverity.Info, `Received response`);
	};

	/**
	 * Handles a response without creation of information alerts
	 * @param body - The reponse body
	 * @param performanceMeasurement - Request durations
	 */
	const handleResponseWithAlert = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement
	) => handleResponse(body, performanceMeasurement, true);

	/**
	 * Handles a response with creation of information alerts
	 * @param body - The response body
	 * @param performanceMeasurement - Request durations
	 */
	const handleResponseWithoutAlert = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement
	) => handleResponse(body, performanceMeasurement, false);

	/**
	 * Handles the received response
	 * @param body - Response body
	 * @param performanceMeasurement - Request durations
	 * @param createAlert - Information alerts creation toggle
	 */
	const handleResponse = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement | undefined,
		createAlert: boolean
	) => {
		setLoading(false);
		logDebugMessage(body);
		if (!checkResponseStatus(body) && createAlert) {
			addInformationAlert(InfoSeverity.Error, body.errMessage);
			return;
		}
		switch (body.operation) {
			case Operation.GetConfig:
				if (createAlert) {
					addInformationAlert(
						InfoSeverity.Success,
						"Updating the protocol configuration"
					);
				}
				setFormValues(JSON.parse(body.message));
				break;
			case Operation.Configure:
				if (createAlert) {
					addInformationAlert(
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

	/**
	 * Handles the myst configuration form submit
	 * @param event
	 */
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
		addInformationAlert(
			InfoSeverity.Info,
			composeRequestInfoAlert("CONFIG")
		);
		send(
			body,
			MYST_SERVICE_ADDRESS,
			handleResponseWithAlert,
			informAboutReceivedResponse,
			() => setLoading(false),
			storeLatency,
			addInformationAlert
		);
	};

	/**
	 * Logs a debug message into the bottom debug area
	 * @param msg - The message to be logged
	 */
	const logDebugMessage = (
		msg: IResponse,
		origin: Origin = Origin.RESPONSE
	) => {
		const res = msg.success
			? OperationResult.Success
			: OperationResult.Error;

		setDebugMessages((prevMessages: IDebugMessages) => ({
			messages: [
				...prevMessages.messages,
				formatLog(res, JSON.stringify(msg), origin, "Myst"),
			],
		}));
	};

	// Request the current config on every component mount / socket state change
	useEffect(() => {
		if (!socketState.isOpen) {
			return;
		}

		// register a subscribe handler for configuration updates
		registerSubscribeHandler(
			MYST_SERVICE_UPDATES_ADDRESS,
			handleProtocolUpdate
		);

		const getConfigMessage: IMessage = {
			operation: Operation.GetConfig,
			data: "",
			protocol: Protocol.Myst,
		};

		send(
			getConfigMessage,
			MYST_SERVICE_ADDRESS,
			handleResponseWithoutAlert,
			undefined,
			undefined,
			storeLatency
		);
	}, [socketState]);

	/**
	 * Handles a configuration update message
	 * @param body - The update message body
	 */
	const handleProtocolUpdate = (body: IResponse) => {
		if (!protocolSetupUpdatesOperations.includes(body.operation)) {
			// We don't want to interpret messages that don't contain protocol updates
			return;
		}

		logDebugMessage(body, Origin.UPDATES);
		if (!checkResponseStatus(body)) {
			addInformationAlert(InfoSeverity.Error, body.errMessage);
			return;
		}
		switch (body.operation) {
			case Operation.GetConfig:
				addInformationAlert(
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
				id={formId}
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
						<ConfirmationDialog
							isDialogOpen={isDialogOpen}
							handleDialogClose={handleDialogClose}
							dialogTitle={"Are you sure?"}
							dialogContent={
								"Modifying the protocol setup can reset the cards and erase all secrets!"
							}
							formName={formId}
						/>
					</Grid>
					<Grid item xs={12}>
						<ProtocolInfoArea {...protocolInfo} />
					</Grid>
				</Grid>
			</form>
		</div>
	);
};
