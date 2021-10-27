import { makeStyles } from "@material-ui/styles";

export const useProtocolStyles = makeStyles(() => ({
	protocol: {
		background: "#dddddd",
		width: "100%",
		["@media (min-width:800px)"]: { width: "50%" },
		margin: "0 auto",
	},
	protocol_form: {
		width: "80%",
		padding: "5em 0 0 0",
		margin: "0 auto",
	},

	protocol_form__protocol_name: {
		margin: "0.5em auto 1em auto",
	},
	protocol_form__data_input_grid: { textAlign: "center" },
	protocol_form__data_input: {
		width: "80%",
	},
	protocol_form__protocol_buttons_grid: {
		textAlign: "center",
		margin: "1em auto 0.5em auto",
	},
	protocol_form__protocol_button: {
		margin: "0.5em 0.5em 1em 0.5em",
	},
}));
