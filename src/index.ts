import Commands from "./commands/commands";
import Routes from './routes/routes';

class Index {
    constructor() {
        this.init();
    }

    init(): void {
        this.registerRoutes();
        this.registerCommands();
    }

    registerCommands(): void {
        new Commands();
    }

    registerRoutes(): void {
        new Routes();
    }
}

new Index();
