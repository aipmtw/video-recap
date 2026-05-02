import sql, { ConnectionPool, config as SqlConfig } from 'mssql';

declare global {
  // eslint-disable-next-line no-var
  var __sqlPool: Promise<ConnectionPool> | undefined;
}

function buildConfig(): SqlConfig {
  const {
    AZURE_SQL_SERVER,
    AZURE_SQL_DATABASE,
    AZURE_SQL_USER,
    AZURE_SQL_PASSWORD,
    AZURE_SQL_PORT,
    AZURE_SQL_ENCRYPT
  } = process.env;

  if (!AZURE_SQL_SERVER || !AZURE_SQL_DATABASE || !AZURE_SQL_USER || !AZURE_SQL_PASSWORD) {
    throw new Error('Azure SQL env vars are not set. See .env.example.');
  }

  return {
    server: AZURE_SQL_SERVER,
    database: AZURE_SQL_DATABASE,
    user: AZURE_SQL_USER,
    password: AZURE_SQL_PASSWORD,
    port: AZURE_SQL_PORT ? Number(AZURE_SQL_PORT) : 1433,
    options: {
      encrypt: AZURE_SQL_ENCRYPT !== 'false',
      trustServerCertificate: false,
      enableArithAbort: true
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
  };
}

export function getPool(): Promise<ConnectionPool> {
  if (!global.__sqlPool) {
    global.__sqlPool = new sql.ConnectionPool(buildConfig())
      .connect()
      .catch((err) => {
        global.__sqlPool = undefined;
        throw err;
      });
  }
  return global.__sqlPool;
}

export { sql };
