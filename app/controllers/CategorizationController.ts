import db from "../lib/connection.js";
const db = require("../lib/connection.js");
interface iRequest{
	query: 
};

module.exports = class CategorizationController {
	private uncategorizedSql: string = "SELECT `transactions`.*\
		FROM `transactions`\
		LEFT JOIN `transaction_categories` ON `transaction_categories`.`transactionId`=`transactions`.id\
		WHERE `transaction_categories`.`id` IS NULL\
		GROUP BY `transactions`.`id` \
		ORDER BY `transactions`.`date`";
		
	getTestRegex(request: { query: { regex: string; }; },response: { send: (arg0: string, arg1: number) => void; }){
		let regString = request.query.regex;
		let reg = new RegExp(regString,'i');
		return db.Transaction.findAll().then( results => {
			results = results.filter(record => {
				return reg.exec(record.description) !== null;
			});
			response.send(JSON.stringify({
				data:results,
				count:results.length,
				regex:request.query.regex
			}),200);
		});
	}

	getCategories(request,response){
		return db.Category.findAll({
			include: [
				{model: db.CategoryRule},
				{model: db.Category,as: 'parent'}
			]
		}).then(result => response.send(result));
	}

	postCreateCategory(request,response){
		if(!request.body.name){
			return response.status(400).send({error: true, message:"Name is a required field"});
		}
		let NewCategory = null;
		return db.Category.create({
			name: request.body.name,
			parentId: request.body.parent || null
		}).then(category => {
			if(!request.body.regex){
				response.send(category);
				return false;
			}
			NewCategory = category;
			return db.CategoryRule.create({
				categoryId:category.id,
				regex: request.body.regex
			});
		}).then(categoryRule => {
			if(categoryRule) return response.send({
				category: NewCategory,
				rule: categoryRule
			});
		});
	}
	
	deleteCategory(request,response){
		if(!request.query.id)return response.status(400).send({error:true,message:"id is a required field"});
		return db.Category.findById(request.query.id).then(category => {
			category.destroy().then(result => response.send({error: false, result:result }));
		});
	}

	postCreateRule(request,response){
		if(!request.body.regex){
			return response.setStatus(400).send({
				error: true,
				message:"regex is a required field"
			});
		}
		if(!request.body.category){
			return response.setStatus(400).send({
				error: true,
				message:"category is a required field"
			});
		}
		return db.CategoryRule.create({
			categoryId: request.body.category,
			regex: request.body.regex
		}).then(result => {
			response.send(result);
		});
	}

	getUncategorized(request,response){
		return db.sequelize.query(this.uncategorizedSql,{model:db.Transaction}).then(result => {
			response.send(result);
		});
	}

	putCategorize(request,response){
		Promise.all([
			db.CategoryRule.findAll(),
			db.sequelize.query(this.uncategorizedSql,{model:db.Transaction})
		]).then(results => {
			let Rules = results[0];
			let Transactions = results[1];
			let matchingTransactions = {};
			for( let rule of Rules ) {
				const regex = new RegExp(rule.regex,'i');
				const trx = Transactions.filter(transaction => regex.exec(transaction.description) !== null);
				if(!matchingTransactions[rule.categoryId]) matchingTransactions[rule.categoryId] = trx;
				else matchingTransactions[rule.categoryId] = [...matchingTransactions[rule.categoryId], ...trx];
			}
			let operations = [];
			for(let Category in matchingTransactions) for ( let transaction of matchingTransactions[Category]) {
				operations.push(db.TransactionCategory.create({
					categoryId: Category,
					transactionId: transaction.id
				}).catch(error => {
					console.warn(error);
				}));
			}
			return Promise.all(operations);
		}).then(FinalResults => {
			return response.send(FinalResults);
		});
	}

	putCategorizeSingle(request,response){
		if(typeof request.query.transaction === "undefined") response.status(400).send({
			error: true,
			message: "Transaction field is required"
		});
		if(typeof request.query.category === "undefined") response.status(400).send({
			error: true,
			message: "Category field is required"
		});

		return db.TransactionCategory.destroy({where: {transactionId: request.query.transaction}})
			.then(() => db.Transaction.findById(request.query.transaction)).then(result => {
			if(result.length === 0) return Promise.reject({error:true,message:"Transaction does not exist"});
			return db.Category.findById(request.query.category);
		}).then(result => {
			if(result.length === 0) return Promise.reject({error:true,message:"Category does not exist"});
			return db.TransactionCategory.create({
				categoryId: request.query.category,
				transactionId: request.query.transaction
			});
		}).then(result => {
			response.send({error: false, result});
		}).catch(result => {
			if(result.error) return response.status(400).send(result);
			return response.status(500).send({error: true, result});
		});
	}
}