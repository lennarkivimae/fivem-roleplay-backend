import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Helpers from '../helpers/helpers';

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
    [key: string]: string | number | IDbConstraint | boolean;
}

interface IDbConstraint {
    column?: string;
    referenceTable: string;
    referenceId?: string;
}

export default class Database {
    static connection: Promise<mysql.Pool> = Database.createConnection();
    static hasLiveConnection: boolean = false;

    //builder
    private sqlQuery: string = '';
    private whereStatement = '';
    private selectStatement = '';
    //eslint-disable-next-line
    private whereData: any = [];

    constructor(selectData: string) {
        this.selectStatement = selectData;
    }

    static async createConnection(): Promise<mysql.Pool> {
        dotenv.config({ path: process.cwd() + `/.env` });

        const connectionSettings: IDbSettings = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT),
            database: process.env.DB,
        }

        const connection: mysql.Pool | void = await mysql.createPool({...connectionSettings, waitForConnections: true, connectionLimit: 10, queueLimit: 0});

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

    /* eslint-disable */
    static async insert(table: string, rows: any[]): Promise<void> {
        for (const row of rows) {
            const columns: string = Object.keys(row).join(', ');
            let valuesArray: any[] = [];

            for (const value of Object.values(row)) {
                if (typeof value === 'string') {
                    valuesArray.push('\'' + value + '\'');
                } else {
                    valuesArray.push(value);
                }
            }

            const values = valuesArray.join(', ');
            const sql: string = `INSERT INTO ${table} (${columns}) VALUES (${values})`;

            await Database.execute(sql);
        }

    }
    /* eslint-enable */

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

    where(columns: IDbColumns, condition = 'AND', compareIndicator: string = '='): Database {
        const columnNames: string[] = Object.keys(columns);
        const statementArrayString: string[] = [];
        this.whereData = this.whereData.concat(Object.values(columns));

        for (const columnName of columnNames) {
            statementArrayString.push(columnName  + compareIndicator + '?');
        }

        const whereStatementAsString: string = statementArrayString.join(' ' + condition + ' ');

        if (this.whereStatement.length === 0) {
            this.whereStatement = ' WHERE ' + `(${whereStatementAsString})`;
        } else {
            this.whereStatement +=  ' OR ' + `(${whereStatementAsString})`;
        }

        return this;
    }

    static select(table: string): Database {
        return  new Database('SELECT * FROM '+ table +'');
    }

    async get(all: boolean = true): Promise<mysql.RowDataPacket[] | mysql.RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader> {
        this.sqlQuery = this.selectStatement + this.whereStatement;
        // eslint-disable-next-line
        const sqlParams: any = [...this.whereData];

        await Database.verifyConnection();
        // eslint-disable-next-line
        // @ts-ignore
        const [rows] = await (await Database.connection).execute(this.sqlQuery, sqlParams);

        return all ? rows : rows[0];
    }

    static async execute(statement: string): Promise<void> {
        await Database.verifyConnection();
        (await Database.connection).execute(statement).catch( err => console.log(err));
    }

    static escape(input: string | number | boolean | IDbConstraint): string {
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

    static getForeignIdType(): string {
        return 'bigint unsigned NOT NULL';
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
            case 'foreignId':
                return Database.getForeignIdType();
        }
    }

    static getContstraint(table: string, columnName: string, constraint: IDbConstraint): string {
        const constraintColumn: string = constraint.column ?? columnName;
        return `CONSTRAINT FK_${table}${constraintColumn} FOREIGN KEY (${constraintColumn}) REFERENCES ${constraint.referenceTable}(${(constraint.referenceId ?? 'id')})`;
    }

    static async create(table: string, columns: IDbColumns[]): Promise<void> {
        await Database.verifyConnection();
        let queryColumns: string[] = [];
        let constraints: string[] = [];

        for (const column of columns) {
            const columnName: string = String(Object.keys(column)[0]);
            const dataLength: number = Number(column.length ?? 0);
            const columnDataType = Database.getDataType(String(column[columnName]), dataLength);


            queryColumns = [
                ...queryColumns,
                `${columnName} ${columnDataType}`
            ];

            if (typeof column.constraint !== 'undefined') {
                constraints = [
                    ...constraints,
                    `${Database.getContstraint(table, columnName, column.constraint as IDbConstraint)}`
                ];
            }
        }

        queryColumns = [
            ...queryColumns,
            ...constraints
        ]

        const query: string = `(${queryColumns.join(',')})`;
        await Database.execute(`CREATE TABLE ${table} ${query}`);
    }

    static async drop(table: string): Promise<void> {
        await Database.verifyConnection();
        await Database.execute(`SET FOREIGN_KEY_CHECKS = 0`);
        await Database.execute(`DROP TABLE IF EXISTS ${table}`);
        await Database.execute(`SET FOREIGN_KEY_CHECKS = 1`);
    }
}
