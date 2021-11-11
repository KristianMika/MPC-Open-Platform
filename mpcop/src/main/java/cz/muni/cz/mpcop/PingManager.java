package cz.muni.cz.mpcop;

import cz.muni.cz.mpcop.cardTools.CardManager;
import cz.muni.cz.mpcop.cardTools.Util;
import cz.muni.fi.mpcop.GeneralMPCOPException;

import javax.smartcardio.CardChannel;
import javax.smartcardio.CardException;
import javax.smartcardio.TerminalFactory;
import java.util.ArrayList;

public class PingManager {
    private final static String appletID = "01ffff0405060708090102";

    public ArrayList<CardChannel> cardsList;
    public ArrayList<Ping> pingPlayers;


    public PingManager(boolean realCard) throws Exception {
        CardManager cardManager = new CardManager(Util.hexStringToByteArray(appletID));
        cardsList = cardManager.connectToAllCardsByTerminalFactory(TerminalFactory.getDefault());
        pingPlayers = new ArrayList<>();
        for (CardChannel cardChannel : cardsList) {
            pingPlayers.add(new Ping(cardChannel));
        }
    }

    public ArrayList<Long> ping() throws CardException, GeneralMPCOPException {
        // TODO: run in parallel
        ArrayList<Long> durations = new ArrayList<>();
        while (durations.size() < pingPlayers.size()) {
            durations.add(0L);
        }

        for (int i = 0; i < pingPlayers.size(); i++) {
            long operationStart = System.currentTimeMillis();
            for (int j = 0; j <= i; j++) {
                pingPlayers.get(j).ping();
            }
            durations.set(i, System.currentTimeMillis() - operationStart);
        }
        return durations;
    }
}
