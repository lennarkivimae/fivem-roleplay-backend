import Database from "../../../database/database";
import Helpers from "../../../helpers/helpers";

interface ISettings {
    target: string,
    amount: number
}

export default class Balance {
    private data: ISettings;

    constructor(username: string, amount: number) {
        this.data = {
            target: username,
            amount: amount
        }

        this.init();
    }

    init(): void {
        this.setBalance();
    }

    async setBalance(): Promise<void> {
        const sql: string = `UPDATE users SET bank=${this.data.amount} where username='${this.data.target}'`;
        Database.execute(sql);

        Helpers.logEvent(`NOTICE: Bank for ${this.data.target} has been changed to ${this.data.amount}`);
        console.log(`Balance for ${this.data.target} set to ${this.data.amount}`);
    }
}
