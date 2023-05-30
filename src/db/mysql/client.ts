import { injectable } from 'inversify';
import mysql from 'mysql2/promise';
import { appConfig } from 'app/config';
import { readdir, readFile } from 'app/utils';

@injectable()
export class MySQLClient {
  private readonly hydratationTablesPath: string = 'src/db/mysql/tables';
  private pool: mysql.Pool | undefined = undefined;

  private async checkConnection(): Promise<void> {
    const connection = await this.getConnection();
    await connection.ping();
    connection.release();
  }

  private async checkDatabase(): Promise<void> {
    const connection = await this.getConnection();
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${appConfig.mysql.database};`
    );
    await connection.query(`use ${appConfig.mysql.database};`);
    const tables: string[] = await readdir(this.hydratationTablesPath);
    const thenables = tables.map(async (table) => {
      const tmp = await readFile(`${this.hydratationTablesPath}/${table}`);
      await connection.query(tmp.toString('utf-8')).catch((err) => {
        throw err;
      });
    });

    await Promise.all(thenables);
    connection.release();
  }

  public async connect(): Promise<void> {
    if (this.pool !== undefined) {
      await this.checkConnection();
      return;
    }

    const { host, user, password } = appConfig.mysql;

    this.pool = mysql.createPool({
      connectionLimit: 10,
      host,
      user,
      password,
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
      throw new Error(
        'MySQLClient not connected, "call connect(): Promise<void>" before'
      );
    }
    return this.pool.getConnection();
  }
}
