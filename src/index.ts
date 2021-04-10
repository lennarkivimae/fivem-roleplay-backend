import Commands from "./commands/commands";
import Database from "./database/database";
import Events from "./events/events";
import Auth from "./events/auth/auth";

class Index {
    constructor() {
        this.init();
    }

    init(): void {
        this.registerEvents();
        this.authorizationEvents();
        this.registerCommands();
        this.initDb();
    }

    registerCommands(): void {
        new Commands;
    }

    authorizationEvents(): void {
        new Auth;
    }

    registerEvents(): void {
        new Events;
    }

    initDb(): void {
        Database.connection = Database.createConnection();
    }
}

new Index();
