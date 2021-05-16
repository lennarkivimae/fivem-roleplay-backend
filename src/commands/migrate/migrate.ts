import Logs from '../../database/migrations/logs';
import Sessions from '../../database/migrations/sessions';
import Users from '../../database/migrations/users';
import Balance from '../../database/migrations/balance';
import * as seeds from './dataseeder.config.json';
import Database from '../../database/database';

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
            Users,
            Balance
        };

        this.init();
    }

    init(): void {
        RegisterCommand('migrate', async (source: number, args: string[]): Promise<void> => {
            const table: string = args[0];

            if (table === 'fresh') {
                await this.freshMigrate();

                return;
            }

            if (table === 'fresh:seed') {
                await this.freshMigrate();
                await this.seed();
            }

        }, true);
    }

    async seed(): Promise<void> {
        const tables: string[] = Object.keys(seeds);

        for (const table of tables) {
            if (table !== 'default') {
                console.log(`[Seed] Seeding: ${table}`);
                // await Database.insert(table, seeds[table].rows);
                for (const row of seeds[table].rows) {
                    await Database.select(table).insert(row);
                }
            }
        }
    }

    async freshMigrate(): Promise<void> {
        await Database.execute(`SET FOREIGN_KEY_CHECKS = 0`);
        for (const table of Object.keys(this.tables)) {
            try {
                console.log(`[Migrate] Dropping table: ${table}`);
                await this.tables[table].down();
            } catch (e) {
                console.log(e);
            }
        }
        await Database.execute(`SET FOREIGN_KEY_CHECKS = 1`);
        for (const table of Object.keys(this.tables)) {
            try {
                console.log(`[Migrate] Creating table: ${table}`);
                await this.tables[table].up();
            } catch (e) {
                console.log(e);
            }
        }
    }
}
