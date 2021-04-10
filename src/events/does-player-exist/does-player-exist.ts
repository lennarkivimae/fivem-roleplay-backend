import Database from "../../database/database";
import Helpers from "../../helpers/helpers";

export default class DoesPlayerExist {
    constructor() {
        this.init();
    }

    init(): void {
        onNet('serverDoesPlayerExist', (data: string[]) => {
            const source: number = Number(data[0]);
            const playerName: string = data[1];

            this.checkUser(source, Database.escape(playerName));
        });
    }

    async checkUser(source: number, playerName: string): Promise<void> {
        const doesUserExist: boolean = await Helpers.checkUser(playerName);
        let response: string = 'false';

        if (doesUserExist) {
            response = 'true';
        }

        emitNet('clientDoesPlayerExist', source, response);
    }
}
