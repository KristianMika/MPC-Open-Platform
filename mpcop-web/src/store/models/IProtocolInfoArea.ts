import React from "react";
import { InfoSeverity } from "../../constants/Constants";

export interface IProtocolInfo {
	severity: InfoSeverity;
	message: string;
	key: React.Key;
}
export default interface IProtocolInfoArea {
	messages: IProtocolInfo[];
}
