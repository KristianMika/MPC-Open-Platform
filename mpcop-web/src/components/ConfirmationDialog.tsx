import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@material-ui/core";
import { IConfirmationDialog } from "../store/models/IConfirmationDialog";

/**
 * The confirmation dialog is used in cases when we need the user to confirm a request
 * It provides two buttons - cancel and proceed
 * @param props - The input props
 */
export const ConfirmationDialog: React.FC<IConfirmationDialog> = (props) => {
	return (
		<Dialog
			open={props.isDialogOpen}
			onClose={props.handleDialogClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">
				{props.dialogTitle}
			</DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-description">
					{props.dialogContent}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={props.handleDialogClose}
					color="primary"
					autoFocus
				>
					Cancel
				</Button>
				<Button
					onClick={props.handleDialogClose}
					form={props.formName}
					type="submit"
				>
					Proceed
				</Button>
			</DialogActions>
		</Dialog>
	);
};
