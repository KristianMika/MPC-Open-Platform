import { Protocol } from "../constants/Constants";
import { verifyRsaCipher } from "../math/cipher";
import { verifyRsaSignature } from "../math/signature";
import { IGeneralProtocol } from "../store/models/IGeneralProtocol";
import { useProtocolStyles } from "../styles/protocol";
import { GeneralProtocol } from "./GeneralProtocol";
import { SmpcRsaSetup } from "./SmpcRsaSetup";

export const SmpcRsa: React.FC = () => {
	const { protocol } = useProtocolStyles();
	const protocolProps: IGeneralProtocol = {
		protocol: Protocol.SmartIdRsa,
		protocolDiplayName: "Smart-ID RSA",
		verifySignature: verifyRsaSignature,
		verifyDecryption: verifyRsaCipher,
	};
	return (
		<main className={protocol}>
			<GeneralProtocol {...protocolProps}></GeneralProtocol>
			<SmpcRsaSetup />
		</main>
	);
};
