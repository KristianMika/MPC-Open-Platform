import { Button, Tooltip } from "@material-ui/core";
import { protocolButtons } from "../constants/Constants";
import { IntroMessage } from "../constants/Intro";
import { IProtocolButton } from "../store/models/IProtocolButton";
import { useProtocolStyles } from "../styles/protocol";

export const ProtocolButtons: React.FC = () => {
	const { protocol_form__protocol_button } = useProtocolStyles();
	const buttons = protocolButtons.map(
		({ name, label, tooltipLabel }: IProtocolButton) => {
			return (
				<Tooltip title={tooltipLabel} key={name}>
					<Button
						variant="contained"
						color="primary"
						type="submit"
						name={name}
						className={protocol_form__protocol_button}
					>
						{label}
					</Button>
				</Tooltip>
			);
		}
	);
	return <div data-intro={IntroMessage.PROTOCOL_BUTTONS}>{buttons}</div>;
};
