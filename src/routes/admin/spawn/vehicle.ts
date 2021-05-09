import Database from "../../../database/database";
import Helpers from "../../../helpers/helpers";

interface IData {
    token: string,
    initiatorName: string,
    initiatorId: number,
    targetName: string,
    targetId: number,
    vehicleHash: number
}

interface IPayload {
    vehicleHash: number
}

export default class Vehicle {
    private data: IData;

    constructor() {
        this.init();
    }

    init(): void {
        onNet('/server/spawn/vehicle', (data: IData) => {
            this.data = data;
            this.spawnHandler();
        });
    }

    async spawnHandler(): Promise<void> {
        const role: string = await Helpers.getRole(this.data.token);
        this.escapeData();

        if (role && role === 'admin') {
            const payload: IPayload = {
                vehicleHash: this.data.vehicleHash
            };

            emitNet('/client/spawn/vehicle', this.data.targetId, payload);
            Helpers.logEvent(`NOTICE: Spawning vehicle for ${this.data.targetName}`, this.data.initiatorName, role);

            return;
        }

        Helpers.sendClientMessage(this.data.initiatorId, ['error', 'Insufficient priviledges']);
        Helpers.logEvent('WARNING: Tried to spawn vehicle with insufficient priviledges', this.data.initiatorName, role);
    }

    escapeData(): void {
        this.data = {
            token: this.data.token,
            initiatorName: Database.escape(this.data.initiatorName),
            initiatorId: Number(Database.escape(this.data.initiatorId)),
            targetName: Database.escape(this.data.targetName),
            targetId: Number(Database.escape(this.data.targetId)),
            vehicleHash: Number(Database.escape(this.data.vehicleHash))
        }
    }
}
