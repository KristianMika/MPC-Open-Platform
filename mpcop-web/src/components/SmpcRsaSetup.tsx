import {
	Button,
	FormControlLabel,
	Grid,
	Switch,
	Tooltip,
	Typography,
} from "@material-ui/core";
import {
	COLOR_PRIMARY,
	InfoSeverity,
	LATENCY_MEASUREMENT_COUNT,
	Operation,
	Protocol,
	protocolSetupUpdatesOperations,
} from "../constants/Constants";
import { IMessage } from "../store/models/IMessage";
import { useProtocolSetupStyles } from "../styles/protocolSetup";
import { registerSubscribeHandler, send } from "../eventbus/eventbus";
import { ChangeEvent, useEffect, useState } from "react";
import { ProtocolInfoArea } from "./ProtocolInfoArea";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { IResponse } from "../store/models/IResponse";
import { useRecoilState } from "recoil";
import {
	debugMessagesState,
	eventbusSocketState,
	latencyState,
	smpcRsaConfigState,
} from "../store/atom";
import { IntroMessage } from "../constants/Intro";
import {
	appendDuration,
	checkResponseStatus,
	composeRequestInfoAlert,
	formatLog,
} from "../utils/utils";
import {
	defaultProtocolInfo,
	ISmpcRsaDefaultFormValues,
} from "../constants/DefaultValues";
import { LoaderSpinner } from "./LoaderSpinner";
import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";
import { OperationResult } from "../constants/Operation";
import {
	SMPC_RSA_SERVICE_ADDRESS,
	SMPC_RSA_SERVICE_UPDATES_ADDRESS,
} from "../constants/Addresses";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { IDebugMessages } from "../store/models/IDebugMessages";
import { Origin } from "../constants/Origin";

/**
 * This component provides user interface for Smart-ID RSA configuration
 */
export const SmpcRsaSetup: React.FC = () => {
	// states
	const [formValues, setFormValues] = useRecoilState(smpcRsaConfigState);
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);
	const [latencies, setLatencies] = useRecoilState(latencyState);
	const [loading, setLoading] = useState<boolean>(false);
	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);

	const {
		protocol_setup_form,
		protocol_form__setup_header,
		container_grid,
		protocol_setup__setup_button,
		protocol_form__switch_label_grid,
	} = useProtocolSetupStyles();

	const formId = "smpcrsa_setup_form";

	//Closes the confirmation dialog
	const handleDialogOpen = () => {
		setIsDialogOpen(true);
	};

	// opens the confirmation dialog
	const handleDialogClose = () => {
		setIsDialogOpen(false);
	};

	/**
	 * Creates an auto-hide information alert
	 * @param severity - Message severity
	 * @param message - The message that will be displayed
	 */
	const addInformationAlert = (severity: InfoSeverity, message: string) => {
		setProtocolInfo({
			messages: [
				...protocolInfo.messages,
				{ message, severity, timestamp: Date.now() },
			],
		});
	};

	/**
	 * Stores a request network latency
	 * @param latency
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
	 * Creates an information alert informing a response from the backend has arrived
	 */
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
	 * Handles the configuration form submit
	 * @param event - Change event
	 */
	const handleSubmit = (event: ChangeEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);

		if (formValues.isClientSimulated && formValues.isServerSimulated) {
			addInformationAlert(
				InfoSeverity.Warning,
				"The server and the client can't be both simulated"
			);
			setLoading(false);
			return;
		}

		const body: IMessage = {
			operation: Operation.Configure,
			data: JSON.stringify(formValues),
			protocol: Protocol.SmartIdRsa,
		};

		addInformationAlert(
			InfoSeverity.Info,
			composeRequestInfoAlert("CONFIG")
		);

		send(
			body,
			SMPC_RSA_SERVICE_ADDRESS,
			handleResponseWithAlert,
			informAboutReceivedResponse,
			() => setLoading(false),
			storeLatency,
			addInformationAlert
		);
	};

	/**
	 * Stores an event change
	 * @param event - The change event
	 */
	const eventSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
		setFormValues({
			...formValues,
			[event.target.name]: event.target.checked,
		});
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
				formatLog(res, JSON.stringify(msg), origin, "Smart-ID RSA"),
			],
		}));
	};

	/**
	 * Handles protocol updates from the update address
	 * @param body
	 * @returns
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

	/**
	 * Request the current config on every component mount / socket state change
	 */
	useEffect(() => {
		if (!socketState.isOpen) {
			return;
		}

		// register a subscribe handler for protocol updates
		registerSubscribeHandler(
			SMPC_RSA_SERVICE_UPDATES_ADDRESS,
			handleProtocolUpdate
		);

		const getConfigMessage: IMessage = {
			operation: Operation.GetConfig,
			data: "",
			protocol: Protocol.SmartIdRsa,
		};

		send(
			getConfigMessage,
			SMPC_RSA_SERVICE_ADDRESS,
			handleResponseWithoutAlert,
			undefined,
			undefined,
			storeLatency
		);
	}, [socketState]);

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
					<Grid
						item
						xs={10}
						className={protocol_form__switch_label_grid}
					>
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

					<Grid
						item
						xs={10}
						className={protocol_form__switch_label_grid}
					>
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
