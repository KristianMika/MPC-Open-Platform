import {
	Button,
	Grid,
	makeStyles,
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
	pingPerformanceDataCsvHeader,
} from "../constants/Constants";
import { defaultProtocolInfo } from "../constants/DefaultValues";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { IResponse } from "../store/models/IResponse";
import {
	checkResponseStatus,
	getDateTimestamp,
	range,
	replicate,
} from "../utils/utils";
import { eventBus } from "./GlobalComponent";
import { ProtocolInfoArea } from "./ProtocolInfoArea";
import { Bar } from "react-chartjs-2";
import { useRecoilState } from "recoil";
import { latencyState } from "../store/atom";
import { CSVLink } from "react-csv";
import { PerformanceMeasurement } from "../performance/PerformanceMeasurement";
import { LoaderSpinner } from "./LoaderSpinner";

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
}));

const createCsvFile = (
	performanceData: number[],
	performanceMeasurement: PerformanceMeasurement,
	operationDuration: number
) => {
	const playersCount = performanceData.length;
	const backend_request_duration =
		performanceMeasurement.computeBackendRequestDuration();
	const backend_response_duration =
		performanceMeasurement.computeBackendResponseDuration();
	const backendOperationDuration =
		performanceMeasurement.computeBackendOperationDuration();
	const rtt =
		operationDuration -
		backendOperationDuration -
		backend_request_duration -
		backend_response_duration;
	const latency = rtt / 2;

	const results = [];
	for (let round = 0; round < playersCount; round++) {
		const roundTimes = [
			round + 1,
			latency,
			backend_request_duration,
			performanceData[round],
			backend_response_duration,
			latency,
		];
		results.push(roundTimes);
	}

	return [pingPerformanceDataCsvHeader, ...results];
};

export const Ping: React.FC = () => {
	const {
		status_page,
		status_page_grid,
		status_page_wrapper,
		status_row,
		ping_header,
		pingButton,
	} = useStyles();

	const [loading, setLoading] = useState<boolean>(false);
	const generateCsvFilename = () =>
		setCsvFileName(`ping_perfdata_${getDateTimestamp()}.csv`);
	const [latencies, setLatencies] = useRecoilState(latencyState);
	const [csvData, setCsvData] = useState<(number[] | string[])[]>([]);
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
	let requestOriginTimestamp: number;
	let requestReceptionTimestamp: number;
	const [protocolInfo, setProtocolInfo] =
		useState<IProtocolInfoArea>(defaultProtocolInfo);

	const [data, setData] = useState<any>();
	const handleSubmit = (event: any) => {
		event.preventDefault();
		setLoading(true);
		requestOriginTimestamp = Date.now();
		setData(null);
		setCsvData([]);

		const operation = event.nativeEvent.submitter.name;

		if (operation === PingOperation.Ping && pingAppletsCount == 0) {
			addDebugMessage(
				InfoSeverity.Warning,
				'Make sure the smartcards are connected. Then click the "FIND CARDS" button.'
			);
			setLoading(false);
			return;
		}
		//TODO: store latency
		eventBus.send("service.ping", operation, (error: Error, msg: any) => {
			requestReceptionTimestamp = Date.now();
			handleResponse(msg.body, msg.headers);
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

	const preparePlottingData = (
		performanceData: number[],
		performanceMeasurement: PerformanceMeasurement
	) => {
		const playersCount = performanceData.length;
		const backend_request_duration =
			performanceMeasurement.computeBackendRequestDuration();

		const backend_response_duration =
			performanceMeasurement.computeBackendResponseDuration();
		const wholeOperationDuration =
			requestReceptionTimestamp - requestOriginTimestamp;
		const backendOperationDuration =
			performanceMeasurement.computeBackendOperationDuration();
		const rtt =
			wholeOperationDuration -
			backendOperationDuration -
			backend_request_duration -
			backend_response_duration;
		const latency = rtt / 2;
		const data = {
			labels: range(playersCount),
			datasets: [
				{
					label: "Network (Request)",
					data: replicate(latency, playersCount),
					backgroundColor: "#264653",
				},
				{
					label: "Backend App (Request)",
					data: replicate(backend_request_duration, playersCount),
					backgroundColor: "#e9c46a",
				},
				{
					label: "JavaCard",
					data: performanceData,
					backgroundColor: "#2a9d8f",
				},
				{
					label: "Backend App (Response)",
					data: replicate(backend_response_duration, playersCount),
					backgroundColor: "#e9c46a",
				},
				{
					label: "Network (Response)",
					data: replicate(latency, playersCount),
					backgroundColor: "#264653",
				},
			],
		};

		setData(data);
	};

	const handleResponse = (body: IResponse, headers: any) => {
		setLoading(false);
		// TODO: add operation to the error message
		if (!checkResponseStatus(body)) {
			addDebugMessage(InfoSeverity.Error, body.errMessage);
			return;
		}
		switch (body.operation) {
			case PingOperation.Connect:
				addDebugMessage(
					InfoSeverity.Success,
					`Successfully connected to ${body.message} cards.`
				);
				setPingAppletsCount(Number(body.message));
				break;

			case PingOperation.Ping:
				const performanceData: number[] = JSON.parse(body.data);
				generateCsvFilename();
				const performanceMeasurement =
					PerformanceMeasurement.fromHeaders(headers);
				preparePlottingData(performanceData, performanceMeasurement);
				setCsvData(
					createCsvFile(
						performanceData,
						performanceMeasurement,
						requestReceptionTimestamp - requestOriginTimestamp
					)
				);
				break;
			default:
				addDebugMessage(InfoSeverity.Success, body.message);
				break;
		}
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

						<Grid item xs={12}>
							<Tooltip title="The number of connected cards with a ping applet. To find new cards, click the FIND CARDS button.">
								<Typography gutterBottom className={status_row}>
									<b>Applets found:</b> {pingAppletsCount}
								</Typography>
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
