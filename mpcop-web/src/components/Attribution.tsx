import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
	footer__attribution_wrapper: {
		width: "100%",
	},
	footer__attribution: {
		textDecoration: "none",
		color: "#898989",
		margin: "auto",
        display: "table"
	},
}));

export const Attribution: React.FC = () => {
	const { footer__attribution_wrapper, footer__attribution } = useStyles();

	return (
		<div className={footer__attribution_wrapper}>
			<a
				href="https://www.freepik.com/vectors/background"
				className={footer__attribution}
			>
				Background vector created by vector_corp - www.freepik.com
			</a>
		</div>
	);
};
