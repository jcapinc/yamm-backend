const db = require("../lib/connection.js");
module.exports = class TransactionController{
	getTransactions(request,response){
		db.Transaction.belongsToMany(db.Category,{
			through:'transaction_categories',
			as: 'category'
		});
		return db.Transaction.findAll({
			include:[{
				model:db.Category,
				as: 'category'
			}]
		}).then(results => response.send(results));
	}
}
