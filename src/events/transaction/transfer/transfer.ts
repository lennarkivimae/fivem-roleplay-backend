import Database from "../../../database/database";
import Helpers from "../../../helpers/helpers";

interface IData {
    token: string;
    playerId: number;
    targetId: number,
    playerName: string,
    targetName: string,
    amount: number
}

interface IBankInformation {
    bank: number
}

export default class Transfer {
    private data: IData;

    constructor() {
        this.init();
    }

    init(): void {
        onNet('serverTransferFunds', (args: string[]) => {
            this.data = {
                token: Database.escape(args[0]),
                playerId: Number(Database.escape(args[1])),
                targetId: Number(Database.escape(args[2])),
                playerName: Database.escape(args[3]),
                targetName: Database.escape(args[4]),
                amount: Number(Database.escape(args[5]))
            }

            this.processTransfer();
        });
    }

    async processTransfer(): Promise<void> {
        if (this.data.playerName == this.data.targetName) {
            Helpers.sendClientMessage(this.data.playerId, ['error', 'Why would you send yourself money?']);

            return;
        }

        if (Helpers.verifySession(this.data.token)) {
            let sql: string = `SELECT bank FROM users where username=${this.data.playerName}`;
            const player: IBankInformation = await Database.query(sql);

            if (this.data.amount && (this.data.amount <= player.bank && this.data.amount > 0)) {
                sql = `SELECT bank FROM users where username =${this.data.targetName}`;
                const target: IBankInformation = await Database.query(sql);

                sql = `UPDATE users SET bank=${player.bank - this.data.amount} WHERE username=${this.data.playerName}`;
                Database.execute(sql);
                sql = `UPDATE users SET bank=${target.bank + this.data.amount} WHERE username=${this.data.targetName}`;
                Database.execute(sql);

                Helpers.sendClientMessage(this.data.playerId, ['success', `You have transfered ${this.data.amount} to ${this.data.targetName}s account`]);
                Helpers.sendClientMessage(this.data.targetId, ['info', `You have received transfer of ${this.data.amount} from ${this.data.targetName}`]);

                Helpers.logEvent(`TRANSFER: TO - ${this.data.targetName} FROM ${this.data.playerName} - AMOUNT: ${this.data.amount}`);
                return;
            }

            Helpers.sendClientMessage(this.data.playerId, ['error', 'Invalid amount or Insufficient funds']);

            return;
        }

        Helpers.sendClientMessage(this.data.playerId, ['error', 'You are not logged in']);
    }
}
