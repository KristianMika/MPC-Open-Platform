import { Button, makeStyles, Tooltip } from "@material-ui/core";
import { useState } from "react";
import { DebugArea } from "./DebugArea";
import { BsFillBugFill } from "react-icons/bs";
import { IoIosHelpBuoy } from "react-icons/io";
import { IconContext } from "react-icons";
import { useRecoilState } from "recoil";
import { debugMessagesState } from "../store/atom";
import introJs from "intro.js";
import { IntroMessage } from "../constants/Intro";

const useStyles = makeStyles(() => ({
	debugArea: { position: "fixed", width: "100%", bottom: 0 },
	debugArea__debugButtons: {
		position: "fixed",
		right: 5,
		bottom: 5,
		margin: "auto 0.5em 1em auto",
		float: "right",
		display: "block",
	},
	debugArea__debugButton: {
		marginTop: "0.5em",
	},
}));

/**
 * The debug area with buttons component contains the bottom debug area as well as
 * the debug area toggle and the help buttons
 */
export const DebugAreaWithButtons: React.FC = () => {
	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);

	const { debugArea__debugButtons, debugArea__debugButton, debugArea } =
		useStyles();
	const [isVisible, setIsVisible] = useState(false);

	// Toggles the debug area visibility
	const toggleDebug = () => {
		setIsVisible(!isVisible);
	};

	const debugAreaElement = isVisible ? (
		<DebugArea {...debugMessages}></DebugArea>
	) : null;
	
	return (
		<footer className={debugArea}>
			<div className={debugArea__debugButtons}>
				<div className={debugArea__debugButton}>
					<Tooltip title="Help">
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								introJs()
									.setOption("disableInteraction", false)
									.start();
							}}
						>
							<IconContext.Provider
								value={{ className: "top-react-icons" }}
							>
								<IoIosHelpBuoy />
							</IconContext.Provider>
						</Button>
					</Tooltip>
				</div>
				<div className={debugArea__debugButton}>
					<Tooltip title="Show/hide debug area">
						<Button
							variant="contained"
							color="primary"
							onClick={toggleDebug}
							data-intro={IntroMessage.DEBUG_BUTTON}
						>
							<IconContext.Provider
								value={{ className: "top-react-icons" }}
							>
								<BsFillBugFill />
							</IconContext.Provider>
						</Button>
					</Tooltip>
				</div>
			</div>
			{debugAreaElement}
		</footer>
	);
};
