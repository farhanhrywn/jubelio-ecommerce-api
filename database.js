const { Client } = require('pg')

const dbConnect = async () => {
	const client = new Client({
		user: 'farhanharyawan',
		host: '127.0.0.1',
		database: 'ecommerce',
		password: 'hanfarhan22',
		port: 5432,
  });
  await client.connect();
  return client;
}

module.exports = {
	dbConnect
}