const { dbConnect } = require('../database')
const { pagination } = require('../helpers/pagination')

const getTransactionList = async (req, res) => {
	try {
		const page = parseInt(req.query.page ?? 1);
		const per_page = parseInt(req.query.per_page ?? 3);
		const offset = page * per_page - per_page;
		const db = await dbConnect()
		let transactions = await db.query(
			`SELECT t.id, t.sku, t.quantity, p.price
			FROM products p INNER JOIN transaction t on p.sku = t.sku ORDER BY t.id DESC LIMIT ${per_page} OFFSET ${offset}`
		)

		let updatedResult = {
			rowCount: 0,
			rows: []
		} 
		await Promise.all(transactions.rows.map((transaction) => {
			const result = {
				id: transaction.id,
				sku: transaction.sku,
				quantity: transaction.quantity,
				amount: Math.abs(transaction.price * transaction.quantity)
			}

			updatedResult.rows.push(result)
			updatedResult.rowCount++
		}))

		const finalResult = await pagination(updatedResult, page, per_page)

		return res.response({
			success: true,
			message: 'Success Get Transaction List',
			data: finalResult
		}).code(200)

	} catch (error) {
		console.log(error.message)
	}
}

const getDetailTransaction = async (req, res) => {
	try {
		const db = await dbConnect()
		const { params } = req
		let transaction = await db.query(
			`SELECT t.id, t.sku, t.quantity, p.price
			FROM products p INNER JOIN transaction t on p.sku = t.sku WHERE t.id = ${params.id}`
		)

		if (!transaction.rowCount) {
			return res.response({
				success: false,
				message: 'Transaction not found',
				data: []
			}).code(404)
		}

		const updatedResult = transaction.rows.map((transaction) => {
			const result = {
				id: transaction.id,
				sku: transaction.sku,
				quantity: transaction.quantity,
				amount: Math.abs(transaction.price * transaction.quantity)
			}

			return result
		})

		return res.response({
			success: true,
			message: 'Success Get Detail Transaction',
			data: updatedResult
		}).code(200)

	} catch (error) {
		console.log(error.message)
	}
}

const createTransaction = async (req, res) => {
	try {
		const { payload } = req
		const db = await dbConnect()
		const transactions = await db.query(`SELECT quantity FROM transaction WHERE sku = '${payload.sku}'`)

		const currentStock = transactions.rows.map(item => item.quantity).reduce((a, b) => a + b, 0);

		if (!currentStock) {
			return res.response({
				success: false,
				message: 'Stock for this product is already 0'
			}).code(400)
		}

		const arrKey = []
		const arrValue = []

		for (const item in payload) {
			arrKey.push(item)
			const dataValue = payload[item] ? `'${payload[item].toString()}'` : null
			arrValue.push(`${dataValue}`)
		}

		const query = `
			INSERT INTO transaction(${arrKey.join(',')})
			VALUES(${arrValue.join(',')})
		`
		const result = await db.query(query)

		return res.response({
			success: true,
			message: 'Success Create Transaction'
		}).code(201)

	} catch (error) {
		console.log(error.message)
	}
}

const updateTransaction = async (req, res) => {
	try {
		const { payload, params } = req
		const db = await dbConnect()
		const transaction = await db.query(
			`SELECT * FROM transaction WHERE id = ${params.id}`
		)

		if (!transaction.rowCount) {
			return res.response({
				success: false,
				message: 'Transaction not found'
			}).code(404)
		}
		
		const arrData = []

		for (const item in payload) {
			const dataValue = payload[item] ? `'${payload[item].toString()}'` : null
			arrData.push(`${item} = ${dataValue}`)
		}

		const query = `UPDATE transaction SET ${arrData.join(',')} WHERE id = ${params.id}`
		await db.query(query)

		return res.response({
			success: true,
			message: 'Success Update Transaction'
		}).code(200)

	} catch (error) {
		console.log(error.message)
	}
}

const deleteTransaction = async (req, res) => {
	try {
		const { params } = req
		const db = await dbConnect()
		const transaction = await db.query(
			`SELECT * FROM transaction WHERE id = ${params.id}`
		)

		if (!transaction.rowCount) {
			return res.response({
				success: false,
				message: 'Transaction not found'
			}).code(404)
		}

		await db.query(`DELETE FROM transaction WHERE id = ${params.id}`)

		return res.response({
			success: true,
			message: 'Success Delete Transaction'
		}).code(200)

	} catch (error) {
		console.log(error.message)
	}
}

module.exports = {
	getTransactionList,
	getDetailTransaction,
	createTransaction,
	updateTransaction,
	deleteTransaction
}