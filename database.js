const { Client } = require('pg')
const dotenv = require('dotenv')

const dbConnect = async () => {
	const client = new Client({
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT || 5432,
  });
  await client.connect();
  return client;
}

module.exports = {
	dbConnect
}