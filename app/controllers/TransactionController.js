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
	deleteTransaction(request,response){
		if(typeof request.query.transaction !== "string"){
			return response.setStatus(400).send({
				error: true,
				message: "Please send the transaction string in the query string"
			});
		}
		console.log(request.query.transaction);
		return db.TransactionCategory.destroy({where: {transactionId:request.query.transaction}}).then(result => {
			return db.Transaction.findById(request.query.transaction)
		}).then(transaction => {
			return transaction.destroy()
		}).then(result => {
			return response.send({
				error: false,
				message: `Deleted transaction ${request.query.transaction} deleted successfully`,
				result: result
			})
		}).catch(error => {
			return response.send({
				error: true,
				message: `There was a problem deleting the transaction ${request.query.transaction}`,
				result: error
			});
		});
	}
}
