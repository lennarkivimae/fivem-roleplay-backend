import Database from "../database";

export default class Logs {
    static async up(): Promise<void> {
        await Database.create('logs', [
            {
                id: 'id'
            },
            {
                events: 'text'
            },
            {
                username: 'string'
            },
            {
                role: 'string'
            }
        ]);
    }

    static async down(): Promise<void> {
        await Database.drop('logs')
    }
}


