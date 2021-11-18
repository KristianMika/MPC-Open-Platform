import { Grid, TextField, Tooltip, Typography } from "@material-ui/core";
import { ChangeEvent, useEffect, useState } from "react";
import {
	COLOR_PRIMARY,
	InfoSeverity,
	LATENCY_MEASUREMENT_COUNT,
	Operation,
	operationsWithInput,
} from "../constants/Constants";
import {
	appendDuration,
	checkResponseStatus,
	composeRequestInfoAlert,
	formatLog,
	OperationResult,
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
	defaultProtocolFormValues,
	defaultProtocolInfo,
} from "../constants/DefaultValues";
import { IGeneralProtocol } from "../store/models/IGeneralProtocol";
import { eventBus } from "./GlobalComponent";
import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";

export const GeneralProtocol: React.FC<IGeneralProtocol> = (props) => {
	// Default values
	const defaultOutputFieldValue = " ";
	const defaultPubKeyValue = " ";

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
	// TODO: for debug purposes only
	const [lastPlaintext, setLastPlaintext] = useState("");

	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);
	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);

	const addDebugMessage = (severity: InfoSeverity, message: string) => {
		setProtocolInfo({
			messages: [
				...protocolInfo.messages,
				{ message, severity, timestamp: Date.now() },
			],
		});
	};
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	const logDebugMessage = (msg: IResponse) => {
		const res = msg.success
			? OperationResult.Success
			: OperationResult.Error;

		const prevMessages = debugMessages.messages;
		setDebugMessages({
			messages: prevMessages.concat([
				formatLog(res, JSON.stringify(msg), props.protocol),
			]),
		});
	};

	const storeLatency = (latency: number) => {
		setLatencies({
			latencies: [
				...latencies.latencies.slice(-LATENCY_MEASUREMENT_COUNT + 1),
				latency,
			],
		});
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
		// TODO: add operation to the error message
		if (!checkResponseStatus(body) && createAlert) {
			addDebugMessage(InfoSeverity.Error, body.errMessage);
			return;
		}
		switch (body.operation) {
			case Operation.Sign:
				console.log(performanceMeasurement?.toString())
				setOutputField(body.signature);
				addDebugMessage(
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
					addDebugMessage(
						InfoSeverity.Success,
						"The signature has been verified successfully"
					);
				} else {
					addDebugMessage(
						InfoSeverity.Warning,
						"Signature verification has failed"
					);
				}

				break;

			case Operation.GetPubkey:
				setPubKey(body.publicKey);
				if (createAlert) {
					addDebugMessage(
						InfoSeverity.Info,
						"Public key has been updated"
					);
				}
				break;

			case Operation.Keygen:
				addDebugMessage(
					InfoSeverity.Success,
					appendDuration("Keys have been generated successfully", performanceMeasurement)
				);
				break;

			case Operation.Reset:
				if (createAlert) {
					setPubKey(defaultPubKeyValue);
					addDebugMessage(
						InfoSeverity.Success,
						appendDuration("The request has been successfully executed", performanceMeasurement)
					);
				}

				break;
			case Operation.Encrypt:
				setOutputField(body.message);
				addDebugMessage(
					InfoSeverity.Success,
					appendDuration("The messages h been encrypted successfully!", performanceMeasurement)
				);
				break;

			case Operation.Decrypt:
				setOutputField(body.message);
				props.verifyDecryption(body.message, lastPlaintext);
				addDebugMessage(
					InfoSeverity.Success,
					appendDuration("The messag has been decrypted successfully!", performanceMeasurement)
				);
				break;
		}
	};

	const handleProtocolUpdate = (body: IResponse) => {
		if (!checkResponseStatus(body)) {
			addDebugMessage(InfoSeverity.Error, body.errMessage);
			return;
		}
		switch (body.operation) {
			case Operation.GetPubkey:
				setPubKey(body.publicKey);
				addDebugMessage(
					InfoSeverity.Info,
					"Public key has been updated"
				);
				break;

			case Operation.Keygen:
				addDebugMessage(
					InfoSeverity.Success,
					"Keys have been generated successfully!"
				);
				break;

			case Operation.Reset:
				setPubKey(defaultPubKeyValue);
				addDebugMessage(
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

		registerSubscribeHandler(
			`${props.protocolVerticleAddress}-updates`,
			handleProtocolUpdate
		);

		const getPubkeyMessage: IMessage = {
			operation: Operation.GetPubkey,
			data: "",
			protocol: props.protocol,
		};

		send(
			getPubkeyMessage,
			props.protocolVerticleAddress,
			handleResponseWithoutAlert
		);
	}, [socketState]);

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
				addDebugMessage(
					InfoSeverity.Success,
					"Input is a valid hex string"
				);
			} else {
				addDebugMessage(
					InfoSeverity.Error,
					"Input is not a valid hex string"
				);
				setLoading(false);
				return;
			}
		}

		const body: IMessage = {
			operation: operation,
			data: inputField,
			protocol: props.protocol,
		};

		addDebugMessage(InfoSeverity.Info, composeRequestInfoAlert(operation));

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
						<ProtocolButtons />
					</Grid>
					<Grid item xs={12}>
						<ProtocolInfoArea {...protocolInfo} />
					</Grid>
				</Grid>
			</form>
		</div>
	);
};
