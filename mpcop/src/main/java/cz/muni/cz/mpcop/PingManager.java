package cz.muni.cz.mpcop;

import cz.muni.cz.mpcop.cardTools.CardManager;
import cz.muni.cz.mpcop.cardTools.Util;
import cz.muni.fi.mpcop.GeneralMPCOPException;

import javax.smartcardio.CardChannel;
import javax.smartcardio.CardException;
import javax.smartcardio.TerminalFactory;
import java.util.ArrayList;
import java.util.Optional;

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

        ArrayList<Long> durations = new ArrayList<>();
        ArrayList<Thread> threads = new ArrayList<>();
        while (durations.size() < pingPlayers.size()) {
            durations.add(0L);
        }

        for (int i = 0; i < pingPlayers.size(); i++) {
            long operationStart = System.currentTimeMillis();


            for (int j = 0; j <= i; j++) {
                Ping player = pingPlayers.get(j);
                Thread t = new Thread(player);
                t.start();
                threads.add(t);
            }

            threads.forEach((Thread t) -> {
                try {
                    t.join();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            });

            durations.set(i, System.currentTimeMillis() - operationStart);

            for (Ping player : pingPlayers) {
                Optional<String> lastError = player.lastError;
                if (lastError.isPresent()) {
                    throw new GeneralMPCOPException(lastError.get());
                }
            }

        }
        return durations;
    }
}
