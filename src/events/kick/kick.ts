import Database from "../../database/database";
import Helpers from "../../helpers/helpers";

interface IData {
    token: string,
    initiatorId: number,
    initiatorName: string,
    targetId: number,
    targetName: string,
    reason: string
}

export default class Kick {
    private data: IData;

    constructor() {
        this.init();
    }

    init(): void {
        onNet('serverKickPlayer', (data: IData) => {
            this.data = data;
            this.kickPlayer();
        });
    }

    async kickPlayer(): Promise<void> {
        const role: string = await Helpers.getRole(this.data.token);

        if (role && (role === 'admin' || role === 'moderator')) {
            DropPlayer(GetPlayerFromIndex(this.data.targetId), this.data.reason);
            Helpers.sendClientMessage(this.data.initiatorId, ['info', `You have kicked ${this.data.targetName} for "${this.data.reason}"`]);
            Helpers.logEvent(`NOTICE: ${this.data.initiatorName} kicked ${this.data.targetName} for "${this.data.reason}"`, this.data.initiatorName, role);
            return;
        }

        Helpers.sendClientMessage(this.data.initiatorId, ['error', 'Insufficient priviledges']);
        Helpers.logEvent(`WARNING: ${this.data.initiatorName} tried to use kick with insufficient priviledges`, this.data.initiatorName, role);
    }

    escapeData(): void {
        this.data = {
            token: this.data.token,
            initiatorId: Number(Database.escape(this.data.initiatorId)),
            initiatorName: Database.escape(this.data.initiatorName),
            targetId: Number(Database.escape(this.data.targetId)),
            targetName: Database.escape(this.data.targetName),
            reason: Database.escape(this.data.reason)
        }
    }
}
