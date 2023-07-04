const pagination = async (model, pageSize, pageLimit) => {
	try {
			const limit = parseInt(pageLimit, 10) || 10;
			const page = parseInt(pageSize, 10) || 1;

			let {rowCount, rows} = model;

			return {
					previous_page: getPreviousPage(page),
					current_page: page,
					next_page: getNextPage(page, limit, rowCount),
					total: rowCount,
					per_page: limit,
					data: rows
			}
	} catch (error) {
			console.log(error);
	}
}

const getOffset = (page, limit) => {
	return (page * limit) - limit;
}

const getNextPage = (page, limit, total) => {
	if ((total/limit) > page) {
			return page + 1;
	}

	return null
}

const getPreviousPage = (page) => {
	if (page <= 1) {
			return null
	}
	return page - 1;
}
module.exports = {
	pagination
}