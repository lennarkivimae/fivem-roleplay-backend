import Database from "../database";

export default class Users {
    static async up(): Promise<void> {
        await Database.create('users', [
            {
                id: 'id'
            },
            {
                username: 'string',
            },
            {
                password: 'text'
            },
            {
                role: 'string'
            }
        ]);
    }

    static async down(): Promise<void> {
        await Database.drop('users')
    }
}
