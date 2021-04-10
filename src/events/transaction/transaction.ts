import Transfer from "./transfer/transfer";

export default class TransactionEvents {
    constructor() {
        this.init();
    }

    init(): void {
        new Transfer;
    }
}
