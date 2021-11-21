import { InfoSeverity } from "../../constants/Constants";

export interface IAutoHideAlert {
	message: string;
	severity: InfoSeverity;
	timestamp: number;
}
