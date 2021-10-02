import { Box, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import React, { useState } from "react";
import { isPropertySignature } from "typescript";





export interface ILoaderSpinner {
	isVisible: boolean;
	color: string
}
export const LoaderSpinner: React.FC<ILoaderSpinner> = (props) => {
	const useStyles = makeStyles(() => ({
		spinner: {
			position: "absolute",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			textAlign: "center",
			top: "55%",
			left: "50%",
			zIndex: 100,
			pointerEvents: "none",
			color: props.color
		},
	}));
	//TODO: show after 0.5s
	const { spinner } = useStyles();
	const loader = props.isVisible ? (
		<CircularProgress className={spinner} />
	) : null;
	return <div>{loader}</div>;
};
