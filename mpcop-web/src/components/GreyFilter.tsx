import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useRecoilState } from "recoil";
import { eventbusSocketState } from "../store/atom";
import { Delayed } from "./Delayed";
import { LoaderSpinner } from "./LoaderSpinner";

const useStyles = makeStyles(() => ({
	grey_filter: {
		position: "absolute",
		width: "100vw",
		height: "100vh",
		background: "rgba(22, 22, 22, 0.8)",
		zIndex: 2147483647,
	},
	connection_warning: {
		color: "white",
		margin: "20% auto 0 auto",
		textAlign: "center",
		zIndex: 2147483647,
	},
}));
export const GreyFilter: React.FC = () => {
	const [socketState, setSocketState] = useRecoilState(eventbusSocketState);
	const { grey_filter, connection_warning } = useStyles();

	const greyFilter = socketState.isOpen ? null : (
		<Delayed {...{ waitBeforeShow: 3000 }}>
			<div className={grey_filter}>
				<Grid container alignItems="center" justify="center">
					<Grid item xs={12} className={connection_warning}>
						<Typography variant="h5" component="h1">
							The connection with the server has been terminated.{" "}
							<br /> Reconnecting...
						</Typography>
					</Grid>
				</Grid>
				<LoaderSpinner {...{ isVisible: true, color: "white" }} />
			</div>
		</Delayed>
	);
	return <div>{greyFilter}</div>;
};
