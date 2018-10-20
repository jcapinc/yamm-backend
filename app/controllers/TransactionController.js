const db = require("../lib/connection.js");
module.exports = class TransactionController{
	getTransactions(request,response){
		let operationMap = {
			'=': db.sequelize.Op.eq,
			'>': db.sequelize.Op.gt,
			'<': db.sequelize.Op.lt,
			'!=':db.sequelize.Op.ne
		};
		let where = request.query.filters ? request.query.filters.split(",").reduce((carry,filter) => {
			let peices = filter.split(':');
			carry[peices[0]] = {[operationMap[peices[1]]]:peices[2]};
			return carry;
		}) : {};
		
		return db.Transaction.findAll({where:where,include:["categories"]})
			.then(results => response.send(results))
			.catch(error =>response.send({error:true, message: error}));
	}
}
