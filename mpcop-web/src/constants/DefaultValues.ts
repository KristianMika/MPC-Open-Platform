import { IMystFormValues } from "../store/models/IMystFormValues";
import { IProtocolFormValues } from "../store/models/IProtocolFormValues";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { InfoSeverity } from "./Constants";

export const defaultProtocolFormValues: IProtocolFormValues = {
	data: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
};

export const defaultProtocolInfo: IProtocolInfoArea = {
	messages:[]
};

export const mystFormDefaultValues: IMystFormValues = {
	virtualCardsCount: 0,
};

export const defautlBarData = {
	labels: [],
	datasets: [
		{
			label: "Network (Request)",
			data: [],
			backgroundColor: "#264653",
		},
		{
			label: "Backend App (Request)",
			data: [],
			backgroundColor: "#e9c46a",
		},
		{
			label: "JavaCard",
			data: [],
			backgroundColor: "#2a9d8f",
		},
		{
			label: "Backend App (Response)",
			data: [],
			backgroundColor: "#e9c46a",
		},
		{
			label: "Network (Response)",
			data: [],
			backgroundColor: "#264653",
		},
	],
};
