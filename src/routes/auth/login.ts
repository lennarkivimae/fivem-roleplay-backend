import md5 from 'md5';
import Database from '../../database/database';
import Helpers from '../../helpers/helpers';

interface ICount {
    count: number;
}

interface IUserData {
    token: string,
    role: string,
    bank: number,
    cash: number
}

export default class Login {
    constructor() {
        this.init();
    }

    init(): void {
        this.registerEvent();
    }

    registerEvent(): void {
        onNet('/server/auth/login', (args: string[]) => {
            const source: number = Number(args[0]);
            const playerName: string = Database.escape(args[1]);
            const password: string = Database.escape(args[2]);

            this.loginHandler(source, playerName, password);
        });
    }

    async loginHandler(source: number, playerName: string, password: string): Promise<void> {
        const doesUserExist: boolean = await Helpers.checkUser(playerName);
        const hashedPassword: string = md5(password);

        if (doesUserExist) {
            this.logUserIn(source, playerName, hashedPassword);

            return;
        }

        Helpers.sendClientMessage(source, ['error', 'This username does not exist, have you registered?']);
        return;
    }

    async checkPassword(playerName: string, password: string): Promise<boolean> {
        const sql: string = `SELECT COUNT(*) as count FROM users WHERE username=${playerName} AND password='${password}'`;
        const results: ICount = await Database.query(sql);

        if (results.count === 1) {
            return true;
        }

        return false;
    }

    async logUserIn(source: number, playerName: string, password: string): Promise<void> {
        const sql: string = `SELECT role, cash, bank FROM users WHERE username=${playerName} AND password='${password}'`;
        const doesPasswordMatch: boolean = await this.checkPassword(playerName, password);

        if (doesPasswordMatch) {
            const user: IUserData  = await Database.query(sql);
            const token: string = await this.initiateToken(playerName, user.role);
            user.token = token;

            emitNet('/client/auth/login', source, user);
            return;
        }

        emitNet('/client/auth/login/error', source, 'wrong-password');
    }

    async initiateToken(playerName: string, role: string): Promise<string> {
        const sql: string = `SELECT COUNT(*) as count FROM sessions WHERE username=${playerName}`;
        const results: ICount = await Database.query(sql);
        const token: string = this.generateToken(36);

        if (results.count > 0) {
            const sql: string = `DELETE FROM sessions WHERE username=${playerName}`;
            await Database.execute(sql);
        }

        Database.execute(`INSERT INTO sessions (session_id, username, role) VALUES ('${token}', ${playerName}, '${role}')`);

        return token;
    }

    generateToken(length: number): string {
        const a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
        const b = [];
        for (let i=0; i<length; i++) {
            const j = (Math.random() * (a.length-1)).toFixed(0);
            b[i] = a[j];
        }
        return b.join("");
    }
}
