import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { useState } from "react";
import {
	InfoSeverity,
	LATENCY_MEASUREMENT_COUNT,
	PingOperation,
} from "../constants/Constants";
import { defaultProtocolInfo } from "../constants/DefaultValues";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { IResponse } from "../store/models/IResponse";
import { checkResponseStatus, range, replicate } from "../utils/utils";
import { eventBus } from "./GlobalComponent";
import { ProtocolInfoArea } from "./ProtocolInfoArea";
import { Bar } from "react-chartjs-2";
import { IAppPerformanceTimestamps } from "../store/models/IAppPerformanceTimestamps";
import { useRecoilState } from "recoil";
import { latencyState } from "../store/atom";

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

	online_indicator: {
		display: "inline-block",
		verticalAlign: "middle",
		margin: "0 0 .2em 0",
	},
	ping_header: { marginBottom: "2em" },
	pingButton: { margin: "0.5em" },
	applet_count_row: { width: "50%", margin: "0 auto" },
}));

export const Ping: React.FC = () => {
	const [latencies, setLatencies] = useRecoilState(latencyState);
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
	const {
		status_page,
		status_page_grid,
		status_page_wrapper,
		status_row,
		online_indicator,
		ping_header,
		applet_count_row,
		pingButton,
	} = useStyles();
	const [data, setData] = useState<any>();
	const handleSubmit = (event: any) => {
		event.preventDefault();
		requestOriginTimestamp = Date.now();
		setData(null);

		const operation = event.nativeEvent.submitter.name;

		if (operation === PingOperation.Ping && pingAppletsCount == 0) {
			addDebugMessage(
				InfoSeverity.Warning,
				'Make sure the smartcards are connected. Then click the "FIND CARDS" button.'
			);
			return;
		}
		//TODO: store latency
		eventBus.send("service.ping", operation, (a: any, msg: any) => {
			console.log(msg);
			requestReceptionTimestamp = Date.now();
			handleResponse(msg.body, msg.headers);
		});
	};

	const addDebugMessage = (severity: InfoSeverity, message: string) => {
		setProtocolInfo({
			messages: [
				...protocolInfo.messages,
				{ message, severity, key: Date.now() },
			],
		});
	};

	const preparePlottingData = (
		performanceData: number[],
		appPerformanceData: IAppPerformanceTimestamps
	) => {
		const playersCount = performanceData.length;
		const backend_request_duration =
			appPerformanceData.operation_origin -
			appPerformanceData.backend_ingress;
		const backend_response_duration =
			appPerformanceData.backend_egress -
			appPerformanceData.operation_done;
		const rtt =
			requestReceptionTimestamp -
			requestOriginTimestamp -
			backend_request_duration -
			backend_response_duration;
		const latency = rtt / 2;
		const data = {
			labels: range(playersCount),
			datasets: [
				{
					label: "Network (Request)",
					data: replicate(latency, playersCount),
					backgroundColor: "#22aa99",
				},
				{
					label: "Backend App (Request)",
					data: replicate(backend_request_duration, playersCount),
					backgroundColor: "#110099",
				},
				{
					label: "JavaCard",
					data: performanceData,
					backgroundColor: "#19a2f7",
				},
				{
					label: "Backend App (Response)",
					data: replicate(backend_response_duration, playersCount),
					backgroundColor: "#110099",
				},
				{
					label: "Network (Response)",
					data: replicate(latency, playersCount),
					backgroundColor: "#22aa99",
				},
			],
		};

		console.log(data);
		setData(data);
	};

	const handleResponse = (body: IResponse, headers: any) => {
		console.log(body);
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
				preparePlottingData(JSON.parse(body.data), headers);
				break;
			default:
				addDebugMessage(InfoSeverity.Success, body.message);
				break;
		}
	};

	const options = {
		scales: {
			xAxes: {
				stacked: true,
				title: {
					display: true,
					text: "Number of participants",
				},
			},
			yAxes: {
				stacked: true,
				title: {
					display: true,
					text: "ms",
				},
			},
		},
	};
	const graph = data ? <Bar data={data} options={options} /> : null;
	console.log(data);
	return (
		<main className={status_page_wrapper}>
			<form onSubmit={handleSubmit} className={status_page}>
				<Grid
					container
					alignItems="center"
					justify="center"
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
						<Typography gutterBottom className={status_row}>
							<b>Applets found:</b> {pingAppletsCount}
						</Typography>
					</Grid>
					<Grid item xs={12} className={status_row}>
						<Button
							type="submit"
							name={PingOperation.Connect}
							variant="contained"
							color="primary"
							className={pingButton}
						>
							Find cards
						</Button>
						<Button
							type="submit"
							name={PingOperation.Ping}
							variant="contained"
							color="primary"
							className={pingButton}
						>
							Ping!
						</Button>
					</Grid>

					<Grid item xs={12}>
						<ProtocolInfoArea {...protocolInfo} />
					</Grid>
				</Grid>
			</form>
		</main>
	);
};
