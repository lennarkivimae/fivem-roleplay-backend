import Database from "../database";

export default class Balance {
    static async up(): Promise<void> {
        await Database.create('balance', [
            {
                id: 'id'
            },
            {
                player_id: 'foreignId',
                constraint: {
                    referenceTable: 'users'
                },
            },
            {
                cash: 'integer'
            },
            {
                bank: 'integer'
            }
        ]);
    }

    static async down(): Promise<void> {
        await Database.drop('balance')
    }
}
