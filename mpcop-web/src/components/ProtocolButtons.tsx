import { Button, Tooltip } from "@material-ui/core";
import { Operation, protocolButtons } from "../constants/Constants";
import { IntroMessage } from "../constants/Intro";
import { IProtocolButton } from "../store/models/IProtocolButton";
import { IProtocolButtons } from "../store/models/IProtocolButtons";
import { useProtocolStyles } from "../styles/protocol";

/**
 * This component contains protocol buttons - fundamental buttons
 * that trigger execution of crypto operations
 */
export const ProtocolButtons: React.FC<IProtocolButtons> = (props) => {
	const { protocol_form__protocol_button } = useProtocolStyles();
	const buttons = protocolButtons
		.filter(
			(button) =>
				!props.disabledButtons.includes(button.name as Operation)
		)
		.map(({ name, label, tooltipLabel }: IProtocolButton) => {
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
		});
	return <div data-intro={IntroMessage.PROTOCOL_BUTTONS}>{buttons}</div>;
};
