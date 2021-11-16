import { Alert, Collapse, IconButton } from "@mui/material";
import {
	InfoSeverity,
	PROTOCOL_ALERT_VISIBILITY_TIME,
} from "../constants/Constants";
import CloseIcon from "@material-ui/icons/Close";
import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core";

export interface IAutoHideAlert {
	message: string;
	severity: InfoSeverity;
	timestamp: number;
}
const useStyles = makeStyles(() => ({
	alert: {
		margin: "0.25em auto",
	},
}));
export const AutoHideAlert: React.FC<IAutoHideAlert> = (props) => {
	const [open, setOpen] = useState(true);
	useEffect(() => {
		setTimeout(() => {
			setOpen(false);
		}, PROTOCOL_ALERT_VISIBILITY_TIME);
	}, [open]);

	const { alert } = useStyles();
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
							console.log("closing");
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
