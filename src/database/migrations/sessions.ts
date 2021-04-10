import Database from "../database";

export default class Sessions {
    static async up(): Promise<void> {
        await Database.create('sessions', [
            {
                id: 'id'
            },
            {
                session_id: 'char',
                length: 36
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
        await Database.drop('sessions')
    }
}
