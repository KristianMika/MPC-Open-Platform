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
	defaultProtocolInfo,
	defautlBarData,
} from "../constants/DefaultValues";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { IResponse } from "../store/models/IResponse";
import {
	add,
	appendDuration,
	appendDurationStr,
	checkResponseStatus,
	divide,
	getDateTimestamp,
} from "../utils/utils";
import { ProtocolInfoArea } from "./ProtocolInfoArea";
import { Bar } from "react-chartjs-2";
import { useRecoilState } from "recoil";
import { latencyState } from "../store/atom";
import { CSVLink } from "react-csv";
import {
	PerformanceMeasurement,
	preparePlottingData,
	processPingMultiMeasurement,
	spreadPerfData,
	toCsv,
} from "../performance/PerformanceMeasurement";
import { LoaderSpinner } from "./LoaderSpinner";
import { send } from "../eventbus/eventbus";
import { IPingFormValues } from "../store/models/IPingFormValues";
import { IProcessedMultiPingMeasurement } from "../store/models/IProcessedMultiPingMeasurement";
import { IPingMultiMeasurement } from "../store/models/IPingMultiMeasurement";

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

export type CsvLines = (number[] | string[])[];
export const Ping: React.FC = () => {
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

	const [loading, setLoading] = useState<boolean>(false);
	const generateCsvFilename = () =>
		setCsvFileName(
			`ping_perfdata_${getDateTimestamp()}_${
				formValues.repetitions
			}_reps.csv`
		);

	const [latencies, setLatencies] = useRecoilState(latencyState);
	const [csvData, setCsvData] = useState<CsvLines>([]);

	const [csvFileName, setCsvFileName] = useState<string>("");
	const storeLatency = (latency: number) => {
		setLatencies({
			latencies: [
				...latencies.latencies.slice(-LATENCY_MEASUREMENT_COUNT + 1),
				latency,
			],
		});
	};
	const [pingAppletsCount, setPingAppletsCount] = useState<number>(0);
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);

	const [data, setData] = useState<any>(defautlBarData);

	const computeAveragedData = (measurements: IPingMultiMeasurement[]) => {
		const processedMeasurements: IProcessedMultiPingMeasurement[] = [];
		let averaged: IProcessedMultiPingMeasurement | null = null;
		for (const measurement of measurements) {
			const processedMeasurement =
				processPingMultiMeasurement(measurement);
			processedMeasurements.push(processedMeasurement);
			if (!averaged) {
				averaged = processedMeasurement;
			} else {
				averaged = add(averaged, processedMeasurement);
			}
		}
		if (averaged != null) {
			averaged = divide(averaged, processedMeasurements.length);
		}

		return averaged;
	};

	const ping = () => {
		generateCsvFilename();
		operationBeginning = Date.now();
		pingRecursive(formValues.repetitions, []);
	};

	// If only there were a mechanism that could enable us to wait for an asynchronous
	// event to finish. Except there is one: promises. No doubt, this mind-boggling mystery
	// of absence of promises in vert.x Eventbus Bridge Client (an ASYNCHRONOUS library for sending
	// messages) rightfully belongs on the list of the greatest mysteries of human history,
	// right between the lost city of Atlantis and the Bermuda Triangle. Nevertheless, let us pause
	// for a second and enjoy the elegance and exquisiteness of the following 100-ish lines of
	// Haskell code with TypeScript syntax that has been written thanks to the mentioned absence of promises.
	const recursivePingResponseHandler = (
		msg: IResponse,
		performanceMeasurement: PerformanceMeasurement,
		itersLeft: number,
		pastMeasurements: IPingMultiMeasurement[]
	) => {
		if (!checkResponseStatus(msg)) {
			addDebugMessage(InfoSeverity.Error, msg.errMessage);
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
			addDebugMessage(
				InfoSeverity.Success,
				appendDurationStr(
					"The performance testing has successfully finished.",
					Date.now() - operationBeginning
				)
			);
			const averagedData = computeAveragedData(newMeasurement);

			if (averagedData) {
				const spreadData = spreadPerfData(averagedData);
				const plottingData = preparePlottingData(spreadData);
				setData(plottingData);
				setCsvData(toCsv(spreadData));
			}
			addDebugMessage(
				InfoSeverity.Success,
				"Performance data has been successfully processed."
			);
		}
	};
	const pingRecursive = (
		iterationsLeft: number,
		pastMeasurements: IPingMultiMeasurement[]
	) => {
		send(
			{ operation: PingOperation.Ping },
			"service.ping",
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
					"service.ping",
					handleConnectResponse,
					undefined,
					() => setLoading(false),
					storeLatency
				);
				break;

			case PingOperation.Ping:
				if (pingAppletsCount == 0) {
					addDebugMessage(
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

	const addDebugMessage = (severity: InfoSeverity, message: string) => {
		setProtocolInfo({
			messages: [
				...protocolInfo.messages,
				{ message, severity, timestamp: Date.now() },
			],
		});
	};

	const handleConnectResponse = (
		body: IResponse,
		performanceMeasurement: PerformanceMeasurement
	) => {
		// TODO: add operation to the error message
		if (!checkResponseStatus(body)) {
			addDebugMessage(InfoSeverity.Error, body.errMessage);
			return;
		}

		addDebugMessage(
			InfoSeverity.Success,
			appendDuration(
				`Successfully connected to ${body.message} cards.`,
				performanceMeasurement
			)
		);
		setPingAppletsCount(Number(body.message));
	};

	const defaultPingFormValues: IPingFormValues = { repetitions: 1 };
	const [formValues, setFormValues] = useState<IPingFormValues>(
		defaultPingFormValues
	);

	const handleSliderChange = (name: string) => (_e: any, value: any) => {
		setFormValues({
			...formValues,
			[name]: value,
		});
	};

	const graph = data ? <Bar data={data} options={barOptions} /> : null;
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
					>
						<Grid item xs={12} className={ping_header}>
							<Typography variant="h5" component="h1">
								Ping
							</Typography>
						</Grid>

						<Grid item xs={12}>
							{graph}
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
						<Grid item xs={12} className={status_row}>
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
