import { Grid, makeStyles, Typography } from "@material-ui/core";

import { useRecoilState } from "recoil";
import { eventbusSocketState, latencyState } from "../store/atom";
import statusOffline from "../status_offline.svg";
import statusOnline from "../status_online.svg";
import { IntroMessage } from "../constants/Intro";
import { computeAverage } from "../utils/utils";
import { useEffect, useState } from "react";

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
		textAlign: "left",
		verticalAlign: "center",
		margin: "2em  auto 1em auto",
	},
	online_indicator: {
		display: "inline-block",
		verticalAlign: "middle",
		margin: "0 0 .2em 0",
	},
}));

/**
 * The home status page component displays server status
 * @returns
 */
export const Home: React.FC = () => {
	// states
	const [latencies, setLatencies] = useRecoilState(latencyState);
	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);
	const [latency, setLatency] = useState(0);

	const {
		status_page,
		status_page_grid,
		status_page_wrapper,
		status_row,
		online_indicator,
	} = useStyles();

	/**
	 * Creates the server online/offline status indicator
	 * @returns the status img
	 */
	const getStatus = () => {
		let statusMessage = "";
		let statusImg = null;
		if (socketState.isOpen) {
			statusMessage = "Online";
			statusImg = statusOnline;
		} else {
			statusMessage = "Offline";
			statusImg = statusOffline;
		}
		return (
			<img
				src={statusImg}
				alt={statusMessage}
				className={online_indicator}
			/>
		);
	};

	// recompute the average latency on every `latencies` update
	useEffect(() => {
		setLatency(Math.round(computeAverage(latencies.latencies)));
	}, [latencies.latencies]);

	return (
		<main className={status_page_wrapper}>
			<div className={status_page}>
				<Grid
					container
					alignItems="center"
					justifyContent="center"
					className={status_page_grid}
					data-intro={IntroMessage.HOME_PAGE_STATUS}
				>
					<Grid item xs={12}>
						<Typography variant="h5" component="h1">
							Status
						</Typography>
					</Grid>

					<Grid item className={status_row}>
						<Typography gutterBottom>
							<b>Server IP:</b> {window.location.hostname}
						</Typography>
						<Typography gutterBottom>
							<b>Status:</b> {getStatus()}
						</Typography>
						<Typography gutterBottom>
							<b>Latency:</b> {latency != 0 ? latency : "?"} ms
						</Typography>
					</Grid>
				</Grid>
			</div>
		</main>
	);
};
