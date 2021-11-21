import { MYST_SERVICE_ADDRESS } from "../constants/Addresses";
import { Protocol } from "../constants/Constants";
import { verifyMystCipher } from "../math/cipher";
import { verifySchnorrSignature } from "../math/signature";
import { IGeneralProtocol } from "../store/models/IGeneralProtocol";
import { useProtocolStyles } from "../styles/protocol";
import { GeneralProtocol } from "./GeneralProtocol";
import { MystSetup } from "./MystSetup";

/**
 * The Myst component "instantiates" the geneal protocol. 
 * It provides a graphical interface for Myst administration
 */
export const Myst: React.FC = () => {
	const { protocol } = useProtocolStyles();
	const protocolProps: IGeneralProtocol = {
		protocol: Protocol.Myst,
		protocolDiplayName: "Myst", 
		protocolVerticleAddress: MYST_SERVICE_ADDRESS,
		verifySignature: verifySchnorrSignature,
		verifyDecryption: verifyMystCipher,
	};
	return (
		<main className={protocol}>
			<GeneralProtocol {...protocolProps}></GeneralProtocol>
			<MystSetup />
		</main>
	);
};
