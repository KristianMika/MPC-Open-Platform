// The header component was inpired by Anh's tutorial
// https://betterprogramming.pub/building-a-basic-header-with-materialui-and-react-js-d650f75b4b0a
import React, { useState } from "react";
import { AppBar, Button, Toolbar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { Link as RouterLink } from "react-router-dom";
import { IntroMessage } from "../constants/Intro";

const useStyles = makeStyles(() => ({
	header: {
		backgroundColor: "#2F343A",
		paddingRight: "5em",
		paddingLeft: "3em",
		zIndex: 500,
	},
	logo: {
		fontFamily: "Work Sans, sans-serif",
		fontWeight: 600,
		color: "white",
		textAlign: "left",
	},
	menuButton: {
		fontFamily: "Open Sans, sans-serif",
		fontWeight: 700,
		size: "1.2em",
		marginLeft: "2.5em",
	},
	toolbar: {
		display: "flex",
		justifyContent: "space-between",
	},
}));

// TODO: responsiveness
export const Header: React.FC = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const menuOpen = Boolean(anchorEl);
	const { header, logo, menuButton, toolbar } = useStyles();
	const mpcopLogo = (
		<Typography variant="h5" component="h1" className={logo}>
			MPCOP
		</Typography>
	);

	const displayDesktop = () => {
		return (
			<Toolbar className={toolbar}>
				{mpcopLogo}
				{getMenuButtons()}
			</Toolbar>
		);
	};

	// TODO: make protocols as a menu dropdown: protocols -> {MediaKeyStatusMap, ECDSA, ...}

	const getMenuButtons = () => {
		return (
			<div data-intro={IntroMessage.HEADER_BUTTONS}>
				<Button
					{...{
						key: "Home",
						color: "inherit",
						to: "/",
						component: RouterLink,
						className: menuButton,
					}}
				>
					{"Home"}
				</Button>

				<Button
					{...{
						key: "Myst",
						color: "inherit",
						to: "/protocols/myst",
						component: RouterLink,
						className: menuButton,
					}}
				>
					{"Myst"}
				</Button>

				<Button
					{...{
						key: "Smart-ID RSA",
						color: "inherit",
						to: "/protocols/smpcrsa",
						component: RouterLink,
						className: menuButton,
					}}
				>
					{"Smart-ID RSA"}
				</Button>
			</div>
		);
	};

	return (
		<header>
			<AppBar className={header}>{displayDesktop()}</AppBar>
		</header>
	);
};
