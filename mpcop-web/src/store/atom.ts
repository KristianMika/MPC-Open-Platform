import { IHeaderData } from "./models/IHeaderData";
import { atom } from "recoil";
import { IDebugMessages } from "./models/IDebugMessages";
import { ISocketState } from "./models/ISocketState";

export const headersDataState = atom<IHeaderData[]>({
	key: "headersData",
	default: [
		{
			label: "Protocols",
			href: "/protocols",
		},
		{
			label: "About",
			href: "/about",
		},
		{
			label: "Contact",
			href: "/contact",
		},
	],
});

export const debugMessagesState = atom<IDebugMessages>({
	key: "debugMessages",
	default: {
		messages: [],
	},
});

export const eventbusSocketState = atom<ISocketState>({
	key: "socketState",
	default: { isOpen: false },
});
