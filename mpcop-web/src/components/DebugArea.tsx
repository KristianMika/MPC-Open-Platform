import { makeStyles, TextField } from "@material-ui/core";
import React from "react";
import { DEBUG_AREA_TEXT_COLOR } from "../constants/Constants";
import { IDebugMessages } from "../store/models/IDebugMessages";
import { joinDebugMessages } from "../utils/utils";

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

/**
 * The bottom debug area present on every page - contains debug logs
 * @param props - The input props
 */
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
						color: DEBUG_AREA_TEXT_COLOR,
					},
				}}
			/>
		</div>
	);
};
