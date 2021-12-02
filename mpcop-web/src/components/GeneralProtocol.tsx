import { Grid, TextField, Tooltip, Typography } from "@material-ui/core";
import { ChangeEvent, useEffect, useState } from "react";
import {
	COLOR_PRIMARY,
	InfoSeverity,
	LATENCY_MEASUREMENT_COUNT,
	Operation,
	operationsWithInput,
	protocolUpdatesOperations,
} from "../constants/Constants";
import {
	appendDuration,
	checkResponseStatus,
	composeRequestInfoAlert,
	formatLog,
	verifyHexString,
} from "../utils/utils";
import { useRecoilState } from "recoil";
import {
	debugMessagesState,
	eventbusSocketState,
	latencyState,
} from "../store/atom";
import { IMessage } from "../store/models/IMessage";
import { IResponse } from "../store/models/IResponse";
import { ProtocolInfoArea } from "./ProtocolInfoArea";
import { ProtocolButtons } from "./ProtocolButtons";
import { useProtocolStyles } from "../styles/protocol";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { LoaderSpinner } from "./LoaderSpinner";
import { registerSubscribeHandler, send } from "../eventbus/eventbus";
import "intro.js/introjs.css";
import { IntroMessage } from "../constants/Intro";
import { IProtocolFormValues } from "../store/models/IProtocolFormValues";
import {
	defaultOutputFieldValue,
	defaultProtocolFormValues,
	defaultProtocolInfo,
	defaultPubKeyValue,
} from "../constants/DefaultValues";
import { IGeneralProtocol } from "../store/models/IGeneralProtocol";
import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";
import { OperationResult } from "../constants/Operation";
import { IDebugMessages } from "../store/models/IDebugMessages";
import { Origin } from "../constants/Origin";

/**
 *
 * The general protocol component is a base component for all protocols.
 * It contains input and output protocol fields as well as operation buttons
 * for protocol querying
 * @param props - Input props
 * @returns General protocol component
 */
export const GeneralProtocol: React.FC<IGeneralProtocol> = (props) => {
	// Styles
	const {
		protocol_form,
		protocol_form__protocol_name,
		protocol_form__data_input_grid,
		protocol_form__protocol_buttons_grid,
		protocol_form__data_input,
	} = useProtocolStyles();

	// States
	const [loading, setLoading] = useState<boolean>(false);
	const [outputField, setOutputField] = useState(defaultOutputFieldValue);
	const [formValues, setFormValues] = useState<IProtocolFormValues>(
		defaultProtocolFormValues
	);
	const [latencies, setLatencies] = useRecoilState(latencyState);
	const [pubKey, setPubKey] = useState(defaultPubKeyValue);
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);
	const [lastPlaintext, setLastPlaintext] = useState("");
	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);
	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);

	/**
	 * Adds an information alert
	 * @param severity - Information severity
	 * @param message - The message to be displayed
	 */
	const addInfoAlert = (severity: InfoSeverity, message: string) => {
		setProtocolInfo({
			messages: [
				...protocolInfo.messages,
				{ message, severity, timestamp: Date.now() },
			],
		});
	};

	/**
	 * Logs a debug message into the bottom debug area
	 * @param msg - The message to be logged
	 */
	const logDebugMessage = (msg: IResponse, origin:Origin=Origin.RESPONSE) => {
		const res = msg.success
			? OperationResult.Success
			: OperationResult.Error;

		setDebugMessages((prevMessages: IDebugMessages) => ({
			messages: [
				...prevMessages.messages,
				formatLog(res, JSON.stringify(msg), origin, props.protocol),
			],
		}));
	};

	/**
	 * Form input change handler
	 * @param e - The change event
	 */
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	/**
	 * Stores a latency into the global state. The number of the most recent
	 * measurements that are keps is specified by the `LATENCY_MEASUREMENT_COUNT` variable
	 * @param latency - The latency in ms to be stored
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
	 * Response handler that creates information alerts
	 * @param body - Response body
	 * @param performanceMeasurement - Request durations
	 */
	const handleResponseWithAlert = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement
	) => handleResponse(body, performanceMeasurement, true);

	/**
	 * Response handler that does not create information alerts
	 * @param body - Response body
	 * @param performanceMeasurement - Request durations
	 */
	const handleResponseWithoutAlert = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement
	) => handleResponse(body, performanceMeasurement, false);

	/**
	 * Response handler
	 * @param body - The response body
	 * @param performanceMeasurement - Request durations
	 * @param createAlert - The toggle deciding if an information alert should be created
	 * @returns
	 */
	const handleResponse = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement | undefined,
		createAlert: boolean
	) => {
		if (!checkResponseStatus(body) && createAlert) {
			addInfoAlert(InfoSeverity.Error, body.errMessage);
			return;
		}
		if (createAlert) {
			addInfoAlert(InfoSeverity.Info, "Received response");
		}

		switch (body.operation) {
			case Operation.Sign:
				console.log(performanceMeasurement?.toString());
				setOutputField(body.signature?.toUpperCase());
				addInfoAlert(
					InfoSeverity.Success,
					appendDuration(
						"The signature has been computed successfully",
						performanceMeasurement
					)
				);
				const wasSigVerificationSuccessfull = props.verifySignature(
					body.signature,
					formValues.data.trim(),
					pubKey
				);

				if (wasSigVerificationSuccessfull) {
					addInfoAlert(
						InfoSeverity.Success,
						"The signature has been verified successfully"
					);
				} else {
					addInfoAlert(
						InfoSeverity.Warning,
						"Signature verification has failed"
					);
				}

				break;

			case Operation.GetPubkey:
				setPubKey(body.publicKey);
				if (createAlert) {
					addInfoAlert(
						InfoSeverity.Info,
						"Public key has been updated"
					);
				}
				break;

			case Operation.Keygen:
				addInfoAlert(
					InfoSeverity.Success,
					appendDuration(
						"Keys have been generated successfully",
						performanceMeasurement
					)
				);
				break;

			case Operation.Reset:
				if (createAlert) {
					setPubKey(defaultPubKeyValue);
					addInfoAlert(
						InfoSeverity.Success,
						appendDuration(
							"The request has been executed successfully",
							performanceMeasurement
						)
					);
				}

				break;
			case Operation.Encrypt:
				setOutputField(body.message?.toUpperCase());
				addInfoAlert(
					InfoSeverity.Success,
					appendDuration(
						"The message has been encrypted successfully!",
						performanceMeasurement
					)
				);
				break;

			case Operation.Decrypt:
				setOutputField(body.message?.toUpperCase());
				addInfoAlert(
					InfoSeverity.Success,
					appendDuration(
						"The message has been decrypted successfully!",
						performanceMeasurement
					)
				);
				if (props.verifyDecryption(body.message, lastPlaintext)) {
					addInfoAlert(
						InfoSeverity.Success,
						"The message has been decrypted to the last encrypted plaintext!"
					);
				}
				break;
		}
	};

	/**
	 * An update protocol handler - It handles updates from the back-end application
	 * (Events like protocol reset by another client)
	 * @param body - Update body
	 */
	const handleProtocolUpdate = (body: IResponse) => {
		if (!protocolUpdatesOperations.includes(body.operation)) {
			// We don't want to interpret messages that don't contain protocol updates
			return;
		}

		logDebugMessage(body, Origin.UPDATES);
		if (!checkResponseStatus(body)) {
			addInfoAlert(InfoSeverity.Error, body.errMessage);
			return;
		}
		switch (body.operation) {
			case Operation.GetPubkey:
				setPubKey(body.publicKey);
				addInfoAlert(InfoSeverity.Info, "Public key has been updated");
				break;

			case Operation.Reset:
				setPubKey(defaultPubKeyValue);
				addInfoAlert(
					InfoSeverity.Success,
					"The protocol has been reset"
				);
				break;
		}
	};

	useEffect(() => {
		if (!socketState.isOpen) {
			return;
		}

		/**
		 * Subscribe to protocol updates address
		 */
		registerSubscribeHandler(
			`${props.protocolVerticleAddress}-updates`,
			handleProtocolUpdate
		);

		const getPubkeyMessage: IMessage = {
			operation: Operation.GetPubkey,
			data: "",
			protocol: props.protocol,
		};

		// once the connection has been reset, fetch the public key
		send(
			getPubkeyMessage,
			props.protocolVerticleAddress,
			handleResponseWithoutAlert
		);
	}, [socketState]);

	/**
	 * Handles the protocol form submits
	 * @param event - The submit event
	 */
	const handleSubmit = (event: any) => {
		event.preventDefault();
		setLoading(true);
		setOutputField(defaultOutputFieldValue);
		const inputField = formValues.data.trim();

		const operation = event.nativeEvent.submitter.name;

		if (operation === Operation.Encrypt) {
			setLastPlaintext(inputField);
		}

		if (operationsWithInput.includes(operation)) {
			if (verifyHexString(inputField)) {
				addInfoAlert(
					InfoSeverity.Success,
					"Input is a valid hex string"
				);
			} else {
				addInfoAlert(
					InfoSeverity.Error,
					"Input is not a valid hex string"
				);
				setLoading(false);
				return;
			}
		}

		// construct the request
		const body: IMessage = {
			operation: operation,
			data: inputField,
			protocol: props.protocol,
		};

		addInfoAlert(InfoSeverity.Info, composeRequestInfoAlert(operation));

		send(
			body,
			props.protocolVerticleAddress,
			handleResponseWithAlert,
			logDebugMessage,
			() => setLoading(false),
			storeLatency
		);
	};

	return (
		<div>
			<LoaderSpinner {...{ isVisible: loading, color: COLOR_PRIMARY }} />

			<form onSubmit={handleSubmit} className={protocol_form}>
				<Grid container alignItems="center" justifyContent="center">
					<Grid item xs={12} className={protocol_form__protocol_name}>
						<Typography variant="h5" component="h1">
							<span data-intro={IntroMessage.PROTOCOL_NAME}>
								{" "}
								{props.protocolDiplayName}
							</span>
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						className={protocol_form__data_input_grid}
					>
						<Tooltip title="The aggregate public key computed by the protocol.">
							<TextField
								InputLabelProps={{ shrink: true }}
								InputProps={{
									readOnly: true,
								}}
								id="pubkey"
								name="pubkey"
								label="Public Key"
								type="text"
								multiline
								value={pubKey}
								rows={3}
								onChange={handleInputChange}
								className={protocol_form__data_input}
								data-intro={IntroMessage.PUBLIC_KEY_FIELD}
							/>
						</Tooltip>
					</Grid>

					<Grid
						item
						xs={12}
						className={protocol_form__data_input_grid}
					>
						<Tooltip title="Output protocol data field.">
							<TextField
								id="data-output"
								name="output"
								label="Output field"
								type="text"
								multiline
								rows={2}
								value={outputField}
								InputProps={{
									readOnly: true,
								}}
								className={protocol_form__data_input}
								data-intro={IntroMessage.DATA_OUTPUT_FIELD}
							/>
						</Tooltip>
					</Grid>
					<Grid
						item
						xs={12}
						className={protocol_form__data_input_grid}
					>
						<Tooltip title="Textfield for input data.">
							<TextField
								id="data-input"
								name="data"
								label="Data input"
								type="text"
								multiline
								rows={2}
								value={formValues.data}
								onChange={handleInputChange}
								className={protocol_form__data_input}
								data-intro={IntroMessage.INPUT_DATA_FIELD}
							/>
						</Tooltip>
					</Grid>
					<Grid
						item
						xs={12}
						className={protocol_form__protocol_buttons_grid}
					>
						<ProtocolButtons disabledButtons={props.disabledButtons}/>
					</Grid>
					<Grid item xs={12}>
						<ProtocolInfoArea {...protocolInfo} />
					</Grid>
				</Grid>
			</form>
		</div>
	);
};
