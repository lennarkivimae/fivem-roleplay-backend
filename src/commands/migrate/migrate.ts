import Logs from "../../database/migrations/logs";
import Sessions from "../../database/migrations/sessions";
import Users from "../../database/migrations/users";

/* eslint-disable */
interface ITables {
    [name: string]: any
}
/* eslint-enable */

export default class Migrate {
    private readonly tables: ITables;

    constructor() {
        this.tables = {
            Logs,
            Sessions,
            Users
        };

        this.init();
    }

    init(): void {
        RegisterCommand('migrate', (source: number, args: string[]): void => {
            const table: string = args[0];

            if (table === 'fresh') {
                this.freshMigrate();
            }

        }, true);
    }

    async freshMigrate(): Promise<void> {
        for (const table of Object.keys(this.tables)) {
            await this.tables[table].down();
            await this.tables[table].up();
        }
    }
}
