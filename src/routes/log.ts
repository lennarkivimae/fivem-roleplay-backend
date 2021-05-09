export default class Log {
    constructor() {
        this.init();
    }

    init(): void {
        onNet('/server/log', (args: string[]) => {
            console.log(args);
        });
    }
}
