import Database from "../../database/database";
import Helpers from "../../helpers/helpers";

interface ISettings {
    token: string,
    initiatorId: number,
    playerId: number,
    targetId: number,
    playerName: string,
    targetName: string,
    targetCoords: number[]
}

interface IPayload {
    playerName: string,
    targetName: string,
    targetCoords: number[]
}

export default class Teleport {
    private data: ISettings;

    constructor() {
        this.init();
    }

    init(): void {
        onNet('/server/admin/teleport', (data: ISettings) => {
            this.data = data;
            this.teleportProcess();
        });
    }

    async teleportProcess(): Promise<void> {
        this.escapeData();
        const role: string = await Helpers.getRole(this.data.token);

        if (role === 'user') {
            Helpers.sendClientMessage(this.data.initiatorId, ['error', 'Insufficient priviledges']);

            return;
        }

        const initiatorName: string = await Helpers.getUserFromSession(this.data.token);
        this.triggerClientEvent();
        Helpers.sendClientMessage(this.data.initiatorId, ['Success', `Teleporting player ${this.data.playerName} to player ${this.data.targetName}`]);
        Helpers.logEvent(`NOTICE: Teleporting player ${this.data.playerName} to player ${this.data.targetName}`, initiatorName, role);
    }

    triggerClientEvent(): void {
        const payload: IPayload = {
            playerName: this.data.playerName,
            targetName: this.data.targetName,
            targetCoords: this.data.targetCoords
        };

        emitNet('/client/admin/teleport', this.data.playerId, payload);
    }

    escapeData(): void {
        const x: number = Number(Database.escape(this.data.targetCoords[0]));
        const y: number = Number(Database.escape(this.data.targetCoords[1]));
        const z: number = Number(Database.escape(this.data.targetCoords[2]));

        this.data = {
            token: this.data.token,
            initiatorId: Number(Database.escape(this.data.initiatorId)),
            playerId: Number(Database.escape(this.data.playerId)),
            targetId: Number(Database.escape(this.data.targetId)),
            playerName: Database.escape(this.data.playerName),
            targetName: Database.escape(this.data.targetName),
            targetCoords: [x,y,z]
        }
    }
}
