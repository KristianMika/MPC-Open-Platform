import { Grid, TextField, Tooltip, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import {
	COLOR_PRIMARY,
	CONTROLLER_ADDRESS,
	InfoSeverity,
	Operation,
	operationsWithInput,
} from "../constants/Constants";
import {
	checkResponseStatus,
	formatLog,
	OperationResult,
	verifyHexString,
} from "../utils/utils";
import { useRecoilState } from "recoil";
import { debugMessagesState, eventbusSocketState } from "../store/atom";
import { IMessage } from "../store/models/IMessage";
import { IResponse } from "../store/models/IResponse";
import { ProtocolInfoArea } from "./ProtocolInfoArea";
import { ProtocolButtons } from "./ProtocolButtons";
import { useProtocolStyles } from "../styles/protocol";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { LoaderSpinner } from "./LoaderSpinner";
import { eventBus } from "./GlobalComponent";
import { send } from "../eventbus/eventbus";
import "intro.js/introjs.css";
import { IntroMessage } from "../constants/Intro";
import { capitalize } from "@mui/material";
import { IProtocolFormValues } from "../store/models/IProtocolFormValues";
import {
	defaultProtocolFormValues,
	defaultProtocolInfo,
} from "../constants/DefaultValues";
import { IGeneralProtocol } from "../store/models/IGeneralProtocol";

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
	const [pubKey, setPubKey] = useState(defaultPubKeyValue);
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);
	// TODO: for debug purposes only
	const [lastPlaintext, setLastPlaintext] = useState("");

	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);
	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);

	const handleInputChange = (e: any) => {
		const { name, value } = e.target;
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	const logDebugMessage = (msg: any) => {
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

	const handleResponse = (body: IResponse) => {
		setProtocolInfo(defaultProtocolInfo);
		if (!checkResponseStatus(body)) {
			setProtocolInfo({
				severity: InfoSeverity.Error,
				message: body.errMessage,
			});
			return;
		}
		switch (body.operation) {
			case Operation.Sign:
				setOutputField(body.signature);
				const wasSigVerificationSuccessfull = props.verifySignature(
					body.signature,
					formValues.data.trim(),
					pubKey
				);

				if (wasSigVerificationSuccessfull) {
					setProtocolInfo({
						severity: InfoSeverity.Success,
						message: "The signature has been verified successfully",
					});
				} else {
					setProtocolInfo({
						severity: InfoSeverity.Warning,
						message: "Signature verification has failed",
					});
				}

				break;

			case Operation.GetPubkey:
				setPubKey(body.publicKey);
				break;

			case Operation.Keygen:
				setPubKey(body.publicKey);
				break;

			case Operation.Reset:
				setProtocolInfo({
					severity: InfoSeverity.Success,
					message: body.message,
				});
				break;
			case Operation.Encrypt:
				setOutputField(body.message);
				break;

			case Operation.Decrypt:
				setOutputField(body.message);
				props.verifyDecryption(body.message, lastPlaintext);
				break;
			default:
				setProtocolInfo({
					severity: InfoSeverity.Info,
					message: body.message,
				});
		}
	};

	useEffect(() => {
		if (!socketState.isOpen) {
			return;
		}
		const getPubkeyMessage: IMessage = {
			operation: Operation.GetPubkey,
			data: "",
			protocol: props.protocol,
		};

		send(getPubkeyMessage, handleResponse);
	}, [socketState]);

	const handleSubmit = (event: any) => {
		event.preventDefault();
		setLoading(true);
		setOutputField(defaultOutputFieldValue);
		const inputField = formValues.data.trim();

		const operation = event.nativeEvent.submitter.name;
		if (operation === Operation.Reset) {
			setPubKey(defaultPubKeyValue);
		}

		if (operation === Operation.Encrypt) {
			setLastPlaintext(inputField);
		}

		if (
			!verifyHexString(inputField) &&
			operationsWithInput.includes(operation)
		) {
			setProtocolInfo({
				severity: InfoSeverity.Error,
				message: "Input is not a valid hex string",
			});
			setLoading(false);
			return;
		}

		const body: IMessage = {
			operation: operation,
			data: inputField,
			protocol: props.protocol,
		};

		// TODO: use a function for this (duplicate)
		eventBus.send(CONTROLLER_ADDRESS, body, (a: any, msg: any) => {
			if (msg == null) {
				setProtocolInfo({
					severity: InfoSeverity.Error,
					message: "An error occured: the back-end hasn't responded",
				});
			} else {
				const bodyJson = JSON.parse(msg.body);
				logDebugMessage(bodyJson);
				handleResponse(bodyJson);
			}
			setLoading(false);
		});
	};

	const protocolName = capitalize(props.protocol);
	return (
		<div>
			<LoaderSpinner {...{ isVisible: loading, color: COLOR_PRIMARY }} />

			<form onSubmit={handleSubmit} className={protocol_form}>
				<Grid container alignItems="center" justify="center">
					<Grid item xs={12} className={protocol_form__protocol_name}>
						<Typography variant="h5" component="h1">
							{protocolName}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						className={protocol_form__data_input_grid}
					>
						<Tooltip title="The aggregate public key computed by the protocol.">
							<TextField
								InputProps={{
									readOnly: true,
								}}
								id="pubkey"
								name="pubkey"
								label="Public Key"
								type="text"
								multiline
								defaultValue="(Not generated yet)"
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
