import { makeStyles, TextField } from "@material-ui/core";
import React from "react";
import { IDebugMessages } from "../store/models/IDebugMessages";

const useStyles = makeStyles(() => ({
	debug_area: {
		background: "rgba(47, 52, 58, 0.9)",
		padding: "0.3em 74pt 0 0.3em",
	},
	debug_area__textField: {
		width: "100%",
		padding: "0.3em 0.3em 0.3em 0.3em",
	},
}));

const joinDebugMessages = (messages: string[]) => messages.join("\n");
export const DebugArea: React.FC<IDebugMessages> = (props) => {
	const { debug_area, debug_area__textField } = useStyles();

	return (
		<div className={debug_area}>
			<TextField
				multiline
				type="text"
				value={joinDebugMessages(props.messages)}
				rows={5}
				className={debug_area__textField}
				inputProps={{
					readOnly: true,

					style: {
						color: "#dddddd",
					},
				}}
			/>
		</div>
	);
};
