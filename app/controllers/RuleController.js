const db = require("../lib/connection.js");

module.exports = class RuleController{
	deleteRule(request,response){
		if(!request.query.rule){
			return response.status(400).send({
				error: true,
				message: "improper input, expected rule to be sent"
			});
		}
		let rule = null;
		let decategorized = null;
		const deleteTransactions = function(transactionList){
			transactionList.map(tx => tx.destroy());
		};
		db.CategoryRule.findById(request.query.rule).then(FindResponse => {
			rule = FindResponse;
			const regex = new RegExp(rule.regex,"i");
			return db.Transaction.findAll().then(TransactionList => {
				const txs = TransactionList.filter(tx => regex.exec(tx.description) !== null);
				return deleteTransactions.bind(this,txs);
			});
		})
		.then( destructions => Promise.all(destructions))
		.then( () => db.CategoryRule.destroy({where:{id:request.rule.id}}))
		.then( result => {
			return response.send({
				error: false,
				message: "successful delete",
				details: {rule,decategorized,result}
			});
		}).catch(error => {
			return response.status(500).send({
				error: true,
				message: "Problem trying to destroy rule",
				details:error
			});
		});
	}
}