'use strict';

const Hapi = require('@hapi/hapi');
const { 
	getProductList,
	getDetailProduct,
	createProduct,
	updateProduct,
	deleteProduct
} = require('./controllers/ProductController')
const {
	getTransactionList,
	getDetailTransaction,
	createTransaction,
	updateTransaction,
	deleteTransaction
} = require('./controllers/TransactionController')
require('dotenv').config();

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (req, res) => {
						const data = { success: true, message: 'Hello World!'};
            return res.response(data).code(400)
        }
    });

		server.route({
			method: 'GET',
			path: '/products',
			handler: getProductList
		});

		server.route({
			method: 'GET',
			path: '/product/{id}',
			handler: getDetailProduct
		});

		server.route({
			method: 'POST',
			path: '/product',
			handler: createProduct
		});

		server.route({
			method: 'PUT',
			path: '/product/{id}',
			handler: updateProduct
		});

		server.route({
			method: 'DELETE',
			path: '/product/{id}',
			handler: deleteProduct
		});

		server.route({
			method: 'GET',
			path: '/transactions',
			handler: getTransactionList
		});

		server.route({
			method: 'GET',
			path: '/transaction/{id}',
			handler: getDetailTransaction
		});

		server.route({
			method: 'POST',
			path: '/transaction',
			handler: createTransaction
		});

		server.route({
			method: 'PUT',
			path: '/transaction/{id}',
			handler: updateTransaction
		});

		server.route({
			method: 'DELETE',
			path: '/transaction/{id}',
			handler: deleteTransaction
		});

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();