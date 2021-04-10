export default class ClientLog {
    constructor() {
        this.init();
    }

    init(): void {
        onNet('clientLog', (args: string[]) => {
            this.consoleLog(args);
        });
    }

    consoleLog(args: string[]): void {
        console.log(args);
    }
}
