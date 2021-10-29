import { makeStyles } from "@material-ui/core";

export const useProtocolSetupStyles = makeStyles(() => ({
	protocol_setup_form: {
		background: "#dddddd",
		width: "100%",
		margin: "0 auto",
		padding: "0 0 2em 0 ",
	},
	protocol_form__setup_header: { margin: "1em auto 2em auto" },
	container_grid: { width: "80%", margin: "0 auto" },
	protocol_setup__setup_button: { textAlign: "center", margin: "0.5em 0" },
	protocol_form__slider: { width: "100%" },
	protocol_form__switch_grid: { textAlign: "left" },
	protocol_form__switch_label_grid: {
		textAlign: "center",
		display: "inline-block",
	},
}));
