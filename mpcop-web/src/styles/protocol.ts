import { makeStyles } from "@material-ui/styles";

export const useProtocolStyles = makeStyles(() => ({
	protocol: {
		background: "#dddddd",
		width: "100%",
		["@media (min-width:800px)"]: { width: "50%" },
		margin: "0 auto",
	},
	protocol_form: {
		padding: "3em 0 0 0",
	},
	protocol_grid: {
		width: "80%",
		margin: "2em auto 0 auto",
	},
	protocol_form__protocol_name: {
		margin: "0.5em auto 1em auto",
	},
	protocol_form__data_input_grid: { textAlign: "center" },
	protocol_form__data_input: {
		width: "80%",
	},
	protocol_form__protocol_button: {
		margin: "2em 0.5em",
		// background: "#DDDDDD",
		// color: "#2F343A",
	},
}));


