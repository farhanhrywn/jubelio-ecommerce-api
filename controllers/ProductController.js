const { dbConnect } = require('../database')
const { pagination } = require('../helpers/pagination')

const getProductList = async (req, res) => {
	try {
		const page = parseInt(req.query.page ?? 1);
		const per_page = parseInt(req.query.per_page ?? 3);
		const offset = page * per_page - per_page;
		const db = await dbConnect()
		const products = await db.query(
			`SELECT p.id, p.name, p.sku, p.image, p.price
			 FROM products p ORDER BY p.id DESC LIMIT ${per_page} OFFSET ${offset}`
		)

		let result = {
			rowsCount: 0,
			rows: []
		}

		await Promise.all(products.rows.map( async (product) => {
			const transactions = await db.query(`SELECT * FROM transaction WHERE sku = '${product.sku}'`)
			const currentStock = await transactions.rows.map(item => item.quantity).reduce((a, b) => a + b, 0);

			result.rows.push({
				...product,
				stock: currentStock
			})

			result.rowsCount++
		}))

		const finalResult = await pagination(result, page, per_page)

		return res.response({
			success: true,
			message: 'Success Get Product List',
			data: finalResult
		}).code(200)

	} catch (error) {
		console.log(error.message)
	}
}

const getDetailProduct = async (req, res) => {
	try {
		const { params } = req
		const db = await dbConnect()
		const result = await db.query(
			`SELECT p.id, p.name, p.sku, p.image, p.price, p.description
			 FROM products p WHERE p.id = ${+params.id}`
		)

		if (result.rowCount) {
			const transactions = await db.query(`SELECT * FROM transaction WHERE sku = '${result.rows[0].sku}'`)
			const currentStock = await transactions.rows.map(item => item.quantity).reduce((a, b) => a + b, 0);

			result.rows[0] = {
				...result.rows[0],
				stock: currentStock
			}
		}

		return res.response({
			success: true,
			message: 'Success Get Detail Product',
			data: result.rows
		}).code(200)

	} catch (error) {
		console.log(error.message)
	}
}

const createProduct = async (req, res) => {
	try {
		const { payload } = req
		const db = await dbConnect()
		const isSkuexist = await db.query(
			`SELECT * FROM products WHERE sku = '${payload.sku}'`
		)

		if (isSkuexist.rowCount) {
			return res.response({
				success: false,
				message: 'SKU already exist'
			}).code(400)
		}

		const result = await db.query(
			`INSERT INTO products(name, sku, image, price, description)
			VALUES('${payload.name}', '${payload.sku}', '${payload.image}', '${payload.price}', '${payload.description}')`
		)
		
		return res.response({
			success: true,
			message: 'Success Create Product'
		}).code(201)

	} catch (error) {
		console.log(error.message)
	}
}

const updateProduct = async (req, res) => {
	try {
		const { payload, params } = req
		const db = await dbConnect()
		const isProductExist = await db.query(
			`SELECT * FROM products WHERE id = ${params.id}`
		)

		if (!isProductExist.rowCount) {
			return res.response({
				success: false,
				message: 'Product not found'
			}).code(404)
		}
		
		const arrData = []

		for (const item in payload) {
			const dataValue = payload[item] ? `'${payload[item].toString()}'` : null
			arrData.push(`${item} = ${dataValue}`)
		}

		const query = `UPDATE products SET ${arrData.join(',')} WHERE id = ${params.id}`
		await db.query(query)

		return res.response({
			success: true,
			message: 'Success Update Product Information'
		}).code(200)
	} catch (error) {
		console.log(error.message)
	}
}

const deleteProduct = async (req, res) => {
	try {
		const { params } = req
		const db = await dbConnect()
		const product = await db.query(
			`SELECT * FROM products WHERE id = ${params.id}`
		)

		if (!product.rowCount) {
			return res.response({
				success: false,
				message: 'Product not found'
			}).code(404)
		}

		await db.query(`DELETE FROM transaction WHERE sku = '${product.rows[0].sku}'`)
		await db.query(`DELETE FROM products WHERE id = ${params.id}`)

		return res.response({
			success: true,
			message: 'Success Delete Product'
		}).code(200)

	} catch (error) {
		console.log(error.message)
	}
}

module.exports = {
	getProductList,
	getDetailProduct,
	createProduct,
	updateProduct,
	deleteProduct
}