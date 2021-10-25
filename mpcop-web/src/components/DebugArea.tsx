import { makeStyles, TextField } from "@material-ui/core";
import React from "react";
import { IDebugMessages } from "../store/models/IDebugMessages";

const useStyles = makeStyles(() => ({
	debug_area: {
		padding: "1em",
		background: "rgba(47, 52, 58, 0.9)",
		width: "calc(100vw - 2em)", // TODO: fix,
	},
	debug_area__textField: {
		width: "100%",
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
