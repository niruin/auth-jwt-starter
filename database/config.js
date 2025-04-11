const { join } = require('path');
const dotenv = require('dotenv').config({ path: join(__dirname, '..', '..', '.env.development') });

const { MYSQLDB_HOST, MYSQLDB_PORT, MYSQLDB_USER, MYSQLDB_PASSWORD, MYSQLDB_DATABASE } =
  dotenv.parsed;

module.exports = {
  development: {
    dialect: 'mysql',
    host: MYSQLDB_HOST,
    port: parseInt(MYSQLDB_PORT),
    username: MYSQLDB_USER,
    password: MYSQLDB_PASSWORD,
    database: MYSQLDB_DATABASE,
  },
};
