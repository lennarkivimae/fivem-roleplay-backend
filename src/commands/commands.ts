import CheckServer from "./check-server/check-server";
import Migrate from "./migrate/migrate";
import Update from "./update/update";

export default class Commands {
    constructor() {
        this.init();
    }

    init(): void {
        this.registerCommands();
    }

    registerCommands(): void {
        new Migrate;
        new Update;
        new CheckServer;
    }
}
