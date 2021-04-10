import Helpers from "../../helpers/helpers";
import Balance from "./balance/balance";
import Role from "./role/role";

export default class Update {
    constructor() {
        this.init();
    }

    init(): void {
        RegisterCommand('update', (source: number, args: string[]) => {
            const command: string = args[0];

            if (command === 'role') {
                const username: string = args[1];
                const role: string = args[2];

                this.setRole(username, role);
            }

            if (command === 'bank') {
                const username: string = args[1];
                const amount: number = Number(args[2]);

                this.setBalance(username, amount);
            }
        }, true);
    }

    async setBalance(username: string, amount: number): Promise<void> {
        const doesUserExist: boolean = await Helpers.checkUser(`'${username}'`);

        if (doesUserExist) {
            new Balance(username, amount);

            return;
        }

        console.log(`System: Couldn't find user: ${username}`);
    }

    async setRole(username: string, role: string): Promise<void> {
        const allowedRoles: string[] = ['admin', 'moderator', 'user'];
        const doesUserExist: boolean = await Helpers.checkUser(`'${username}'`);

        if (!allowedRoles.includes(role)) {
            console.log(`Invalid role - Allowed roles: ${allowedRoles}`);

            return;
        }

        if (doesUserExist) {
            new Role(username, role);

            return;
        }

        console.log(`System: Couldn't find user: ${username}`);
    }
}
