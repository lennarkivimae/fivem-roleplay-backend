import Database from "../database/database";

interface ICount {
    count: number;
}

interface IRole {
    role: string;
}

interface IName {
    name: string;
}

export default class Helpers {
    static sendClientMessage(source: number, payload: string[]): void {
        const messageLevel: string = payload[0];
        const message: string = payload[1];

        emitNet('receiveServerMessage', source, [messageLevel, message]);
    }

    static async verifySession(token: string): Promise<boolean> {
        const sql: string = `SELECT COUNT(*) as count FROM sessions WHERE session_id='${token}'`;
        const results: ICount = await Database.query(sql);

        if (results.count > 0) {
            return true;
        }

        return false;
    }

    static async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    static async getRole(token: string): Promise<string> {
        const sessionExists: boolean = await this.verifySession(token);

        if (sessionExists) {
            const sql: string = `SELECT role FROM sessions WHERE session_id="${token}"`;
            const results: IRole = await Database.query(sql);

            return results.role;
        }

        return '';
    }

    static async getUserFromSession(token: string): Promise<string> {
        const sessionExists: boolean = await this.verifySession(token);

        if (sessionExists) {
            const sql: string = `SELECT username as name FROM sessions WHERE session_id="${token}"`;
            const results: IName = await Database.query(sql);

            return results.name;
        }

        return '';
    }

    static async checkUser(playerName: string): Promise<boolean> {
        const sql: string = `SELECT COUNT(*) as count FROM users WHERE username=${playerName}`;
        const results: ICount = await Database.query(sql);

        if (results.count > 0) {
            return true;
        }

        return false;
    }

    static logEvent(event: string, username: string = 'rcon', role: string = 'rcon'): void {
        const sql: string = `INSERT INTO logs (events, username, role) VALUES ('${event}', '${username}', '${role}')`;
        Database.execute(sql);
    }
}
