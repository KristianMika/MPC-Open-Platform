import { Alert, Collapse, IconButton } from "@mui/material";
import { PROTOCOL_ALERT_VISIBILITY_TIME } from "../constants/Constants";
import CloseIcon from "@material-ui/icons/Close";
import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core";
import { IAutoHideAlert } from "../store/models/IAutoHideAlert";

const useStyles = makeStyles(() => ({
	alert: {
		margin: "0.25em auto",
	},
}));

/**
 * Auto hide alert is used for information alerts (messages). After it has been displayed
 * for the specified time, the alert is automatically hidden
 * @param props - The input props
 */
export const AutoHideAlert: React.FC<IAutoHideAlert> = (props) => {
	const [open, setOpen] = useState(true);
	const { alert } = useStyles();

	// set a timeout to hide the component
	useEffect(() => {
		setTimeout(() => {
			setOpen(false);
		}, PROTOCOL_ALERT_VISIBILITY_TIME);
	}, [open]);

	return (
		<Collapse in={open} key={props.timestamp}>
			<Alert
				className={alert}
				severity={props.severity}
				action={
					<IconButton
						aria-label="close"
						color="inherit"
						size="small"
						onClick={() => {
							setOpen(false);
						}}
					>
						<CloseIcon fontSize="inherit" />
					</IconButton>
				}
			>
				{props.message}
			</Alert>
		</Collapse>
	);
};
