import { Button, Grid, makeStyles, Tooltip } from "@material-ui/core";
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
	debugArea__debugButton: {
		margin: "0.5em 0.5em 0.5em auto",
	},
	container_grid: { width: "100%", position: "absolute", bottom: 0, left: 0 },
	reactIcon: {
		fontSize: "50rem",
	},
}));
// TODO: can't click through the invisible button parent
export const DebugAreaButton: React.FC = () => {
	const [debugMessages, setDebugMessages] =
		useRecoilState(debugMessagesState);

	const { debugArea__debugButton, container_grid, reactIcon } = useStyles();
	const [isVisible, setIsVisible] = useState(false);
	const toggleDebug = () => {
		setIsVisible(!isVisible);
		console.log(isVisible);
	};

	const debugArea = isVisible ? (
		<DebugArea {...debugMessages}></DebugArea>
	) : null;
	return (
		<footer>
			<Grid
				container
				alignItems="center"
				justify="flex-end"
				direction="column"
				className={container_grid}
			>
				<Tooltip title="Help">
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							introJs()
								.setOption("disableInteraction", false)
								.start();
						}}
						className={debugArea__debugButton}
					>
						<IconContext.Provider
							value={{ className: "top-react-icons" }}
						>
							<IoIosHelpBuoy />
						</IconContext.Provider>
					</Button>
				</Tooltip>
				<Tooltip title="Show/hide debug area">
					<Button
						variant="contained"
						color="primary"
						onClick={toggleDebug}
						className={debugArea__debugButton}
						data-intro={IntroMessage.DEBUG_BUTTON}
					>
						<IconContext.Provider
							value={{ className: "top-react-icons" }}
						>
							<BsFillBugFill />
						</IconContext.Provider>
					</Button>
				</Tooltip>

				<Grid item xs={12}>
					{debugArea}
				</Grid>
			</Grid>
		</footer>
	);
};
