// The header component is inpired by Anh's tutorial:
// https://betterprogramming.pub/building-a-basic-header-with-materialui-and-react-js-d650f75b4b0a
import React, { useEffect, useState } from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	makeStyles,
	Button,
	IconButton,
	Drawer,
	Link,
	MenuItem,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import { Link as RouterLink } from "react-router-dom";
import { IntroMessage } from "../constants/Intro";
import { headerData, MOBILE_WIDTH_BREAKPOINT } from "../constants/Constants";

const useStyles = makeStyles(() => ({
	header: {
		backgroundColor: "#2F343A",
		paddingRight: "5em",
		paddingLeft: "3em",
		zIndex: 500,
		"@media (max-width: 800px)": {
			paddingLeft: 0,
		},
	},
	logo: {
		fontFamily: "Work Sans, sans-serif",
		fontWeight: 600,
		color: "white",
		textAlign: "left",
	},
	menu_button: {
		fontFamily: "Open Sans, sans-serif",
		fontWeight: 700,
		size: "1.2em",
		margin: "auto 1em",
	},
	toolbar: {
		display: "flex",
		justifyContent: "space-between",
	},
	drawer_container: {
		padding: "20px 30px",
	},
	drawer_container__exit_button: {
		position: "absolute",
		bottom: 10,
		right: 20,
	},
}));

/**
 * The header component is displayed at the top of the page.
 * It contains navigation buttons
 * @returns
 */
export const Header: React.FC = () => {
	const [state, setState] = useState({
		mobileView: false,
		drawerOpen: false,
	});

	const { mobileView, drawerOpen } = state;

	/**
	 * Sets responsiveness based on the window width
	 */
	useEffect(() => {
		const setResponsiveness = () => {
			return window.innerWidth < MOBILE_WIDTH_BREAKPOINT
				? setState((prevState) => ({ ...prevState, mobileView: true }))
				: setState((prevState) => ({
						...prevState,
						mobileView: false,
				  }));
		};

		setResponsiveness();
		window.addEventListener("resize", () => setResponsiveness());

		return () => {
			window.removeEventListener("resize", () => setResponsiveness());
		};
	}, []);

	const {
		header,
		logo,
		menu_button,
		toolbar,
		drawer_container,
		drawer_container__exit_button,
	} = useStyles();

	/**
	 * The logo component that is displayed in the left part of the header
	 */
	const mpcopLogo = (
		<Typography variant="h5" component="h1" className={logo}>
			MPCOP
		</Typography>
	);

	/**
	 * @returns a desktop toolbar component
	 */
	const displayDesktop = () => {
		return (
			<Toolbar className={toolbar}>
				{mpcopLogo}
				{getMenuButtons()}
			</Toolbar>
		);
	};
	/**
	 * Openes a closed drawer
	 */
	const handleDrawerOpen = () =>
		setState((prevState) => ({ ...prevState, drawerOpen: true }));
	/**
	 * Closes an opened drawer
	 */
	const handleDrawerClose = () =>
		setState((prevState) => ({ ...prevState, drawerOpen: false }));

	/**
	 * @returns  a mobile toolbar component
	 */
	const displayMobile = () => {
		return (
			<Toolbar>
				<IconButton
					{...{
						edge: "start",
						color: "inherit",
						"aria-label": "menu",
						"aria-haspopup": "true",
						onClick: handleDrawerOpen,
					}}
				>
					<MenuIcon data-intro={IntroMessage.HEADER_DRAWER} />
				</IconButton>

				<Drawer
					{...{
						anchor: "left",
						open: drawerOpen,
						onClose: handleDrawerClose,
					}}
				>
					<div className={drawer_container}>
						<div className={drawer_container__exit_button}>
							<IconButton
								{...{
									edge: "end",
									color: "inherit",
									"aria-label": "menu",
									"aria-haspopup": "true",
									onClick: handleDrawerClose,
								}}
							>
								<CloseIcon />
							</IconButton>
						</div>
						{getDrawerChoices()}
					</div>
				</Drawer>

				<div>{mpcopLogo}</div>
			</Toolbar>
		);
	};

	/**
	 * @returns a collection of header menu links - used in the mobile view
	 */
	const getDrawerChoices = () => {
		return headerData.map(({ label, href }) => {
			return (
				<Link
					{...{
						component: RouterLink,
						to: href,
						color: "inherit",
						style: { textDecoration: "none" },
						key: label,
						onClick: handleDrawerClose,
					}}
				>
					<MenuItem>{label}</MenuItem>
				</Link>
			);
		});
	};

	/**
	 * Returns an array of header menu buttons wrapped in a div
	 * @returns an array of header menu buttons wrapped in a div
	 */
	const getMenuButtons = () => {
		const buttons = headerData.map(({ label, href }) => {
			return (
				<Button
					{...{
						key: label,
						color: "inherit",
						to: href,
						component: RouterLink,
						className: menu_button,
					}}
				>
					{label}
				</Button>
			);
		});
		return <div data-intro={IntroMessage.HEADER_BUTTONS}>{buttons}</div>;
	};

	return (
		<header>
			<AppBar className={header}>
				{mobileView ? displayMobile() : displayDesktop()}
			</AppBar>
		</header>
	);
};
