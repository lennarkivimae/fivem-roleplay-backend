import ClientLog from "./client-log/client-log";
import DoesPlayerExist from "./does-player-exist/does-player-exist";
import Give from "./give/give";
import Kick from "./kick/kick";
import Spawn from "./spawn/spawn";
import Teleport from "./teleport/teleport";
import TransactionEvents from "./transaction/transaction";

export default class Events {
    constructor() {
        this.init();
    }

    init(): void {
        new ClientLog;
        new TransactionEvents;
        new Teleport;
        new Give;
        new Spawn;
        new Kick;
        new DoesPlayerExist;
    }
}
