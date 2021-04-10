import Database from "../../../database/database";
import Helpers from "../../../helpers/helpers";

export default class Role {
    private username: string;
    private role: string;

    constructor(username: string, role: string) {
        this.username = username;
        this.role = role;
        this.init();
    }

    init(): void {
        this.setRole();
    }

    async setRole(): Promise<void> {
        const sql: string = `UPDATE users SET role='${this.role}' WHERE username='${this.username}'`;
        Database.execute(sql);
        Helpers.logEvent(`rconEvent: ${this.username} role changed to ${this.role}`);
        console.log(`System: setRole executed`);
    }
}
