import Database from "../../database/database";
import Helpers from "../../helpers/helpers";
import md5 from 'md5';
import Globals from "../../globals/globals";

export default class Register {
    constructor() {
        this.init();
    }

    init(): void {
        onNet('/server/auth/register', (args: string[]) => {
            const source: number = Number(args[0]);
            const playerName: string = Database.escape(args[1]);
            const password: string = Database.escape(args[2]);

            this.registerHandler(source, playerName, password);
        });
    }

    async registerHandler(source: number, playerName: string, password: string): Promise<void> {
        const doesUserExist: boolean = await Helpers.checkUser(playerName);

        if (doesUserExist) {
            Helpers.sendClientMessage(source, ['error', 'This username is taken']);
            return;
        }

        if (password && password.length < 8) {
            Helpers.sendClientMessage(source, ['error', 'Password needs to be at least 8 characters long']);
            return;
        }

        const hashedPassword: string = md5(password);
        this.registerPlayer(source, playerName, hashedPassword);
    }

    async registerPlayer(source: number, playerName: string, password: string): Promise<void> {
        const defaultBank: number = Globals.registerSettings.bankUponRegister;
        const defaultCash: number = Globals.registerSettings.cashUponRegister;
        const defaultRole: string = Globals.registerSettings.role;

        const sql = `INSERT INTO users (username, password, cash, bank, role) VALUES (${playerName}, '${password}', ${defaultCash}, ${defaultBank}, '${defaultRole}')`;
        await Database.execute(sql);

        const doesUserExist: boolean = await Helpers.checkUser(playerName);

        if (doesUserExist) {
            Helpers.sendClientMessage(source, ['success', 'Welcome! You have successfully registered']);

            emitNet('/client/auth/register', source, 'true');
            return;
        }

        Helpers.sendClientMessage(source, ['error', 'Something went wrong :(']);
    }
}
