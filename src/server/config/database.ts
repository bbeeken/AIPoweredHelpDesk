import sql from 'mssql';
import { config } from './environment';

interface DatabaseConfig {
  server: string;
  database: string;
  user?: string;
  password?: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    enableArithAbort: boolean;
  };
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
}

const dbConfig: DatabaseConfig = {
  server: config.db.server,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  options: {
    encrypt: config.db.encrypt,
    trustServerCertificate: config.db.trustServerCertificate,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

class DatabaseService {
  private static instance: DatabaseService;
  private pool: sql.ConnectionPool | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async connect(): Promise<void> {
    try {
      this.pool = new sql.ConnectionPool(dbConfig);
      await this.pool.connect();
      console.log('Connected to MSSQL database');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async query<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    const request = this.pool.request();
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });
    let processedQuery = queryText;
    let paramIndex = 0;
    processedQuery = processedQuery.replace(/\?/g, () => `@param${paramIndex++}`);
    const result = await request.query(processedQuery);
    return result.recordset;
  }

  async execute(queryText: string, params: any[] = []): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }
    const request = this.pool.request();
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });
    let processedQuery = queryText;
    let paramIndex = 0;
    processedQuery = processedQuery.replace(/\?/g, () => `@param${paramIndex++}`);
    return await request.query(processedQuery);
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}

export default DatabaseService;
