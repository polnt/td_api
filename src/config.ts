import 'dotenv/config';

interface iAppConfig {
  app: {
    url: string;
    port: number;
    production: boolean;
    secret: string;
    expiresIn: string;
  };
  mysql: {
    host: string;
    user: string;
    password: string;
    database: string;
  };
}

const appConfig: iAppConfig = {
  app: {
    url: process.env.API_HOST || 'localhost',
    port: Number(process.env.API_PORT) || 3000,
    production: false,
    secret: process.env.SECRET_KEY_JWT || 'secret',
    expiresIn: '24h',
    // https: {
    //   port: 8443,
    //   tls: {
    //     certificate: "tls/server.crt",
    //     key: "tls/key.pem",
    //   },
    // },
  },
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'td_api',
  },
};

export { appConfig, iAppConfig };
