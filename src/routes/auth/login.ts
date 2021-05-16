import md5 from 'md5';
import Database from '../../database/database';
import Helpers from '../../helpers/helpers';

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
            const playerName: string = args[1].toLowerCase();
            const password: string = args[2];

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
        const foundUser = await Database.select('users').where({
            username: playerName,
            password: password
        }).get(false);

        if (typeof foundUser[0] !== 'undefined' && typeof foundUser[0].username === 'string') {
            return true;
        }

        return false;
    }

    async logUserIn(source: number, playerName: string, password: string): Promise<void> {
        const user = await Database.select('users')
            .where({
                username: playerName,
                password: password
            }).get(false);

        if (typeof user[0] !== 'undefined' && typeof user[0].password === 'string') {
            const balance = await Database.select('balance')
                .where({
                    player_id: user[0].id
                }).get(false);

            const token: string = await this.initiateToken(playerName, user[0].role);

            const userData: IUserData = {
                role: user[0].role,
                bank: balance[0].bank,
                cash: balance[0].cash,
                token: token
            };

            emitNet('/client/auth/login', source, userData);
            return;
        }

        emitNet('/client/auth/login/error', source, 'wrong-password');
    }

    async initiateToken(playerName: string, role: string): Promise<string> {
        const existingSession = await Database.select('sessions')
            .where({
                username: playerName
            }).get(false);

        const token: string = this.generateToken(36);

        if (typeof existingSession[0] !== 'undefined') {
            await Database.select('sessions').where({
                username: playerName
            }).delete();
        }

        Database.select('sessions').insert({
            session_id: token,
            username: playerName,
            role: role
        });

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
