import { InfoSeverity } from "../../constants/Constants";

export default interface IProtocolInfoArea {
	severity: InfoSeverity;
	message: string | null;
}
