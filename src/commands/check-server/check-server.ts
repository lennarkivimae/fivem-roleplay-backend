import Database from "../../database/database";

export default class CheckServer {
    constructor() {
        this.init();
    }

    init(): void {
        RegisterCommand('checkServer', () => {
            this.checkServer();
        }, true);
    }

    async checkServer(): Promise<void> {
        console.log(`!----------- Ordu Gaming -----------!`);
        await this.checkDB();
        console.log(`!-----------------------------------!`);
    }

    async checkDB(): Promise<void> {
        await Database.checkConnection();

        return;
    }
}
