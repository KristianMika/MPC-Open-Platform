import { IMystFormValues } from "../store/models/IMystFormValues";
import { IPingFormValues } from "../store/models/IPingFormValues";
import { IProtocolFormValues } from "../store/models/IProtocolFormValues";
import IProtocolInfoArea from "../store/models/IProtocolInfoArea";
import { ISmpcRsaFormValues } from "../store/models/ISmpcRsaFormValues";

export const defaultProtocolFormValues: IProtocolFormValues = {
	// hash of the word "password"
	data: "5E884898DA28047151D0E56F8DC6292773603D0D6AABBDD62A11EF721D1542D8",
};

export const defaultProtocolInfo: IProtocolInfoArea = {
	messages: [],
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

export const defaultOutputFieldValue = " ";

export const defaultPubKeyValue = " ";

export const defaultPingFormValues: IPingFormValues = { repetitions: 1 };

export const ISmpcRsaDefaultFormValues: ISmpcRsaFormValues = {
	isServerSimulated: true,
	isClientSimulated: false,
};
