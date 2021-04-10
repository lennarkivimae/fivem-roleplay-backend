import Helpers from "../../../helpers/helpers";

interface IData {
    token: string,
    initiatorId: number,
    initiatorName: string,
    targetId: number,
    weaponHash: number
}

export default class Weapon {
    private data: IData;

    constructor() {
        this.init();
    }

    init(): void {
        onNet('serverGiveWeapon', (data: IData) => {
            this.data = data;
            this.weaponHandler();
        });
    }

    async weaponHandler(): Promise<void> {
        const role: string = await Helpers.getRole(this.data.token);

        if (role === 'admin') {
            emitNet('clientGiveWeapon', this.data.targetId, this.data.weaponHash);

            return;
        }

        Helpers.sendClientMessage(this.data.initiatorId, ['error', 'Insufficient priviledges']);
        Helpers.logEvent(`WARNING: ${this.data.initiatorName} tried to giveWeapon`);
    }
}
