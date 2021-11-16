import { InfoSeverity } from "../../constants/Constants";

export interface IProtocolInfo {
	severity: InfoSeverity;
	message: string;
	timestamp: number;
}
export default interface IProtocolInfoArea {
	messages: IProtocolInfo[];
}
