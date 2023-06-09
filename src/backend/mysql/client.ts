import { injectable } from 'inversify';
import mysql, { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { readFile, readdir } from 'fs/promises';
import { appConfig } from 'app/config';

@injectable()
export class MySQLClient {
  private readonly tablesPath: string = 'src/backend/mysql/tables';
  private readonly fkeysPath: string = 'src/backend/mysql/postinit/postinit.sql';
  private pool: mysql.Pool | undefined = undefined;

  private async checkConnection(): Promise<void> {
    const connection = await this.getConnection();
    await connection.ping();
    connection.release();
  }

  private async checkDatabase(): Promise<void> {
    const connection = await this.getConnection();
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${appConfig.mysql.database};`);
    await connection.query(`use ${appConfig.mysql.database};`);
    const tables: string[] = await readdir(this.tablesPath);
    const thenables = tables.map(async (table) => {
      const tmp = await readFile(`${this.tablesPath}/${table}`);
      const fkeys: Buffer = await readFile(this.fkeysPath);
      await connection.query(tmp.toString('utf-8'));
      await connection.query(fkeys.toString('utf-8'));
    });

    await Promise.all(thenables);
    connection.release();
  }

  public async connect(): Promise<void> {
    if (this.pool !== undefined) {
      await this.checkConnection();
      return;
    }

    const { host, user, password, port } = appConfig.mysql;

    this.pool = mysql.createPool({
      connectionLimit: 10,
      host,
      user,
      password,
      port
    });

    await this.checkConnection();
    await this.checkDatabase();
  }

  public async disconnect(): Promise<void> {
    if (this.pool !== undefined) {
      await this.pool.end();
      this.pool = undefined;
    }
  }

  public async getConnection(): Promise<mysql.PoolConnection> {
    if (this.pool === undefined) {
      throw new Error('MySQLClient not connected, call "connect(): Promise<void>" before');
    }
    return this.pool.getConnection();
  }

  public processRows(rows: RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[] | ResultSetHeader): any[] {
    const filteredRows = [rows]
      .map((row) => (JSON.parse(JSON.stringify(row)).length ? { ...row } : undefined))
      .filter((elem) => elem !== undefined);

    return filteredRows.length ? filteredRows.map((elem) => (<any>Object).values(elem))[0] : [];
  }
}
