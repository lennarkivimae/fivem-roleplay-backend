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
                cash: 'integer'
            },
            {
                bank: 'integer'
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
