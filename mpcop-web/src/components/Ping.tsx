import {
	Button,
	Grid,
	makeStyles,
	Slider,
	Tooltip,
	Typography,
} from "@material-ui/core";
import { useState } from "react";
import {
	barOptions,
	COLOR_PRIMARY,
	InfoSeverity,
	LATENCY_MEASUREMENT_COUNT,
	PingOperation,
} from "../constants/Constants";
import {
	defaultPingFormValues,
	defaultProtocolInfo,
	defautlBarData,
} from "../constants/DefaultValues";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { IResponse } from "../store/models/IResponse";
import {
	appendDuration,
	appendDurationStr,
	checkResponseStatus,
	formatLog,
	getDateTimestamp,
} from "../utils/utils";
import { ProtocolInfoArea } from "./ProtocolInfoArea";
import { Bar } from "react-chartjs-2";
import { useRecoilState } from "recoil";
import { debugMessagesState, latencyState } from "../store/atom";
import { CSVLink } from "react-csv";
import {
	computeAverageMeasurement,
	PerformanceMeasurement,
	preparePlottingData,
	spreadPerfData,
	toCsv,
} from "../performance/PerformanceMeasurement";
import { LoaderSpinner } from "./LoaderSpinner";
import { send } from "../eventbus/eventbus";
import { IPingFormValues } from "../store/models/IPingFormValues";
import { IPingMultiMeasurement } from "../store/models/IPingMultiMeasurement";
import { CsvLines } from "../constants/Types";
import { PING_SERVICE_ADDRESS } from "../constants/Addresses";
import { OperationResult } from "../constants/Operation";
import { IDebugMessages } from "../store/models/IDebugMessages";
import { Origin } from "../constants/Origin";
import { IntroMessage } from "../constants/Intro";

const useStyles = makeStyles(() => ({
	status_page: {
		padding: "3em 0 2em 0",
	},
	status_page_grid: { width: "80%", margin: "2em auto 0 auto" },

	status_page_wrapper: {
		background: "#dddddd",
		width: "100%",
		["@media (min-width:800px)"]: { width: "50%" },
		margin: "0 auto",
	},

	status_row: {
		textAlign: "center",
		margin: "0.5em auto",
	},

	ping_header: { marginBottom: "2em" },
	pingButton: { margin: "0.5em" },
	ping__applet_count: { margin: "0.5em auto 2em auto" },
}));

/**
 * The ping component provides interface for platform performance testing
 */
export const Ping: React.FC = () => {
	const pingServiceAddress = "service.ping";

	// states
	const [loading, setLoading] = useState<boolean>(false);
	const [latencies, setLatencies] = useRecoilState(latencyState);
	const [csvData, setCsvData] = useState<CsvLines>([]);
	const [csvFileName, setCsvFileName] = useState<string>("");
	const [pingAppletsCount, setPingAppletsCount] = useState<number>(0);
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);
	const [data, setData] = useState<any>(defautlBarData);
	const [formValues, setFormValues] = useState<IPingFormValues>(
		defaultPingFormValues
	);
	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);

	let operationBeginning: number;
	const {
		status_page,
		status_page_grid,
		status_page_wrapper,
		status_row,
		ping_header,
		pingButton,
		ping__applet_count,
	} = useStyles();

	/**
	 * Generates and sets the csv performance results filename
	 */
	const generateCsvFilename = () =>
		setCsvFileName(
			`ping_perfdata_${getDateTimestamp()}_${
				formValues.repetitions
			}_reps.csv`
		);

	const storeLatency = (latency: number) => {
		setLatencies({
			latencies: [
				...latencies.latencies.slice(-LATENCY_MEASUREMENT_COUNT + 1),
				latency,
			],
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
				formatLog(res, JSON.stringify(msg), origin, "Ping"),
			],
		}));
	};

	/**
	 * Triggers the performance test and generates new csv filename
	 */
	const ping = () => {
		generateCsvFilename();
		operationBeginning = Date.now();
		pingRecursive(formValues.repetitions, []);
	};

	/**
	 * Handles recursive ping requests
	 * @param msg - Ping response
	 * @param performanceMeasurement - Measurement of the current ping request
	 * @param itersLeft - The number of ping requests to send
	 * @param pastMeasurements - An array of previous ping measurements
	 */
	const recursivePingResponseHandler = (
		msg: IResponse,
		performanceMeasurement: PerformanceMeasurement,
		itersLeft: number,
		pastMeasurements: IPingMultiMeasurement[]
	) => {
		if (!checkResponseStatus(msg)) {
			addInformationAlert(InfoSeverity.Error, msg.errMessage);
			setLoading(false);
			return;
		}
		const javaCardMeasurements: number[] = JSON.parse(msg.data);
		const newMeasurement: IPingMultiMeasurement[] = [
			...pastMeasurements,
			{ performanceMeasurement, javaCardMeasurements },
		];

		if (itersLeft > 0) {
			pingRecursive(itersLeft, newMeasurement);
		} else {
			setLoading(false);
			addInformationAlert(
				InfoSeverity.Success,
				appendDurationStr(
					"The performance testing has successfully finished.",
					Date.now() - operationBeginning
				)
			);

			// compute the averade durations
			const averagedData = computeAverageMeasurement(newMeasurement);

			if (averagedData) {
				const spreadData = spreadPerfData(averagedData);
				const plottingData = preparePlottingData(spreadData);
				setData(plottingData);
				setCsvData(toCsv(spreadData));

				addInformationAlert(
					InfoSeverity.Success,
					"Performance data has been successfully processed."
				);
			} else {
				addInformationAlert(
					InfoSeverity.Error,
					"Measurement processing and plotting failed."
				);
			}
		}
	};

	/**
	 * Recursively sends ping requests
	 * @param iterationsLeft
	 * @param pastMeasurements - Measurements of the past requests
	 */
	const pingRecursive = (
		iterationsLeft: number,
		pastMeasurements: IPingMultiMeasurement[]
	) => {
		send(
			{ operation: PingOperation.Ping },
			PING_SERVICE_ADDRESS,
			(msg: IResponse, perfHeaders: PerformanceMeasurement) =>
				recursivePingResponseHandler(
					msg,
					perfHeaders,
					iterationsLeft - 1,
					pastMeasurements
				),
			undefined,
			undefined,
			storeLatency
		);
	};

	/**
	 * Submit handler
	 * @param event - The submit event
	 */
	const handleSubmit = (event: any) => {
		event.preventDefault();
		setLoading(true);
		setData(defautlBarData);
		setCsvData([]);

		const operation: PingOperation = event.nativeEvent.submitter.name;

		switch (operation) {
			case PingOperation.Connect:
				send(
					{ operation },
					pingServiceAddress,
					handleConnectResponse,
					undefined,
					() => setLoading(false),
					storeLatency
				);
				break;

			case PingOperation.Ping:
				if (pingAppletsCount == 0) {
					addInformationAlert(
						InfoSeverity.Warning,
						'Make sure the smartcards are connected. Then click the "FIND CARDS" button.'
					);
					setLoading(false);
					return;
				}
				ping();
				break;
		}
	};

	const addInformationAlert = (severity: InfoSeverity, message: string) => {
		setProtocolInfo({
			messages: [
				...protocolInfo.messages,
				{ message, severity, timestamp: Date.now() },
			],
		});
	};

	/**
	 * Handles the connect response
	 * @param body - The response body
	 * @param performanceMeasurement  - Request durations
	 */
	const handleConnectResponse = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement
	) => {
		logDebugMessage(body);
		if (!checkResponseStatus(body)) {
			addInformationAlert(InfoSeverity.Error, body.errMessage);
			return;
		}

		addInformationAlert(
			InfoSeverity.Success,
			appendDuration(
				`Successfully connected to ${body.message} cards.`,
				performanceMeasurement
			)
		);
		setPingAppletsCount(Number(body.message));
	};

	/**
	 * Slider change handler - updates form values on every slider change
	 * @param name - Property name
	 */
	const handleSliderChange = (name: string) => (_e: any, value: any) => {
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	// display the download button only when the performance measurement is present and ready to be downloaded
	const downloadButton = csvData?.length ? (
		<Tooltip title="Download performance data as a csv file for later analysis">
			<CSVLink
				data={csvData}
				filename={csvFileName}
				className={pingButton}
			>
				<Button variant="contained" color="primary">
					Download csv
				</Button>
			</CSVLink>
		</Tooltip>
	) : null;

	return (
		<div>
			<LoaderSpinner {...{ isVisible: loading, color: COLOR_PRIMARY }} />
			<main className={status_page_wrapper}>
				<form onSubmit={handleSubmit} className={status_page}>
					<Grid
						container
						alignItems="center"
						justifyContent="center"
						className={status_page_grid}
						data-intro={IntroMessage.PING}
					>
						<Grid item xs={12} className={ping_header}>
							<Typography variant="h5" component="h1">
								Ping
							</Typography>
						</Grid>

						<Grid item xs={12}>
							<Bar
								data={data}
								options={barOptions}
								data-intro={IntroMessage.PING_BAR}
							/>
						</Grid>

						<Grid item xs={12} className={ping__applet_count}>
							<Tooltip title="The number of connected cards with a ping applet. To find new cards, click the FIND CARDS button.">
								<Typography gutterBottom className={status_row}>
									<b>Applets found:</b> {pingAppletsCount}
								</Typography>
							</Tooltip>
						</Grid>
						<Grid item xs={3}>
							<Typography
								id="discrete-slider-restrict"
								gutterBottom
							>
								Repetitions:
							</Typography>
						</Grid>
						<Grid item xs={7}>
							<Tooltip title="Number of requests sent from the browser">
								<Slider
									value={formValues.repetitions}
									onChange={handleSliderChange("repetitions")}
									step={1}
									min={1}
									max={100}
									marks={[
										{
											value: 1,
											label: "1",
										},
										{
											value: 100,
											label: "100",
										},
									]}
									valueLabelDisplay="on"
								/>
							</Tooltip>
						</Grid>
						<Grid
							item
							xs={12}
							className={status_row}
							data-intro={IntroMessage.PING_BUTTONS}
						>
							<Tooltip title="Finds and connects to JavaCards with the ping applet.">
								<Button
									type="submit"
									name={PingOperation.Connect}
									variant="contained"
									color="primary"
									className={pingButton}
								>
									Find cards
								</Button>
							</Tooltip>
							<Tooltip title="Sends a simple request, receives a response and plots durations of specific phases.">
								<Button
									type="submit"
									name={PingOperation.Ping}
									variant="contained"
									color="primary"
									className={pingButton}
								>
									Ping!
								</Button>
							</Tooltip>

							{downloadButton}
						</Grid>

						<Grid item xs={12}>
							<ProtocolInfoArea {...protocolInfo} />
						</Grid>
					</Grid>
				</form>
			</main>
		</div>
	);
};
