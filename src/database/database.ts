import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Helpers from '../helpers/helpers';
import * as config from '../../server.config.json';

interface IDbSettings {
    host: string,
    user: string,
    password?: string,
    port: number,
    database: string
}

interface IIsConnected {
    connected: string
}

interface IDbColumns {
    [key: string]: string | number;
}

export default class Database {
    static connection: Promise<mysql.Connection> = Database.createConnection();
    static hasLiveConnection: boolean = false;

    static async createConnection(): Promise<mysql.Connection> {
        dotenv.config({ path: process.cwd() + `/${config.env}/.env` });

        const connectionSettings: IDbSettings = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT),
            database: process.env.DB
        }

        const connection: mysql.Connection | void = await mysql.createConnection(connectionSettings);

        const [rows] = await connection.execute('SELECT 1 as connected');

        if (Number(rows[0].connected) === 1) {
            console.log('\x1b[36m%s\x1b[0m', 'Connected to database!');
        } else {
            console.log('\x1b[31m%s\x1b[0m', 'Failed to connect to database!');
        }

        return connection;
    }

    static async verifyConnection(): Promise<void> {
        Database.hasLiveConnection = false;

        await this.queryDatabase();
        await Helpers.sleep(300);

        if (Database.hasLiveConnection) {
            return;
        }

        Database.connection = Database.createConnection();
    }

    static async queryDatabase(): Promise<void> {
        const [rows] = await (await Database.connection).execute('SELECT 1 as connected');
        const response = rows[0].connected;

        if (Number(response) === 1) {
            Database.hasLiveConnection = true;

            return;
        }

        Database.hasLiveConnection = false;
    }

    static async checkConnection(): Promise<void> {
        console.log(`!----------- Checking database connections -----------!`);
        const isConnected: IIsConnected = await Database.query('SELECT 1 as connected');

        if (Number(isConnected.connected) === 1) {
            console.log(`!----------- End of checkConnection -----------!`);
            return;
        }

        console.log('\x1b[31m%s\x1b[0m', 'Failed to connect to database!');
        console.log(`!----------- End of checkConnection -----------!`);
    }

    /* eslint-disable */
    static async query(statement: string): Promise<any> {
        await Database.verifyConnection();
        const [rows] = await (await Database.connection).execute(statement);

        return rows[0];
    }
    /* eslint-enable */

    static async execute(statement: string): Promise<void> {
        await Database.verifyConnection();
        (await Database.connection).execute(statement);
    }

    static escape(input: string|number): string {
        return mysql.escape(input);
    }

    static stringifyArray(array: string[], seperator: string = ','): string {
        let stringifiedArray = '';

        if (array && array.length > 0) {
            let index: number = 0;

            for (const string of array) {
                if (index == 0) {
                    stringifiedArray += `${string}`;
                    index += 1;

                    continue;
                }
                stringifiedArray += `${seperator}${string}`;

                index += 1;
            }
        }

        return stringifiedArray;
    }

    static getPrimaryKey(): string {
        return 'bigint unsigned auto_increment NOT NULL PRIMARY KEY';
    }

    static getTextType(): string {
        return 'text';
    }

    static getStringType(length?: number): string {
        return (length > 0) ? `varchar(${length})` : 'varchar(255)';
    }

    static getCharType(length?: number): string {
        return (length > 0) ? `char(${length})` : 'char(255)';
    }

    static getIntType(): string {
        return 'INT';
    }

    static getDataType(datatype: string, length?: number): string {
        switch (datatype) {
            case 'id':
                return Database.getPrimaryKey();
            case 'text':
                return Database.getTextType();
            case 'string':
                return Database.getStringType(length);
            case 'char':
                return Database.getCharType(length);
            case 'integer':
                return Database.getIntType();
        }
    }

    static async create(table: string, columns: IDbColumns[]): Promise<void> {
        await Database.verifyConnection();
        let queryColumns: string[] = [];

        for (const column of columns) {
            const columnName: string = String(Object.keys(column)[0]);
            const dataLength: number = Number(Object.keys(column)[1] ?? 0);
            const columnDataType = Database.getDataType(String(column[columnName]), dataLength);

            queryColumns = [
                ...queryColumns,
                `${columnName} ${columnDataType}`
            ];
        }

        const query: string = `(${queryColumns.join(',')})`;
        await Database.execute(`CREATE TABLE ${table} ${query}`);
    }

    static async drop(table: string): Promise<void> {
        await Database.verifyConnection();
        await Database.execute(`DROP TABLE IF EXISTS ${table}`);
    }
}
