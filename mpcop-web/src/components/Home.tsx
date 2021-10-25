import {
	Grid,
	makeStyles,
	Typography,
} from "@material-ui/core";

import { useRecoilState } from "recoil";
import { eventbusSocketState } from "../store/atom";
import { useProtocolStyles } from "../styles/protocol";
import { useProtocolSetupStyles } from "../styles/protocolSetup";
import statusOffline from "../status_offline.svg";
import statusOnline from "../status_online.svg";
import { IntroMessage } from "../constants/Intro";
const useStyles = makeStyles(() => ({
	status_page: {
		padding: "3em 0 2em 0",
	},
	status_page_grid: { width: "80%", margin: "2em auto 0 auto" },

	status_label: { textAlign: "right" },
	status_value: {
		textAlign: "left",
		padding: "0 0 0 0.5em",
		verticalAlign: "center",
	},
}));

export const Home: React.FC = () => {
	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);
	const { protocol, protocol_grid } = useProtocolStyles();
	const { status_page, status_page_grid, status_label, status_value } =
		useStyles();

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
			<div>
				<img src={statusImg} alt={statusMessage} />
				<span>{statusMessage}</span>
			</div>
		);
	};
	return (
		<main className={protocol}>
			<div className={status_page}>
				<Grid
					container
					alignItems="center"
					justify="center"
					className={status_page_grid}
					data-intro={IntroMessage.HOME_PAGE_STATUS}
				>
					<Grid item xs={12}>
						<Typography variant="h5" component="h1">
							Status
						</Typography>
					</Grid>
					<Grid item xs={6} className={status_label}>
						<Typography gutterBottom>Server IP:</Typography>
					</Grid>
					<Grid item xs={6} className={status_value}>
						<Typography>{window.location.hostname}</Typography>
					</Grid>
					<Grid item xs={6} className={status_label}>
						<Typography>Status:</Typography>
					</Grid>
					<Grid item xs={6} className={status_value}>
						{getStatus()}
					</Grid>
					<Grid item xs={6} className={status_label}>
						<Typography>RTT:</Typography>
					</Grid>
					<Grid item xs={6} className={status_value}>
						TODO ms
					</Grid>
				</Grid>
			</div>
		</main>
	);
};
