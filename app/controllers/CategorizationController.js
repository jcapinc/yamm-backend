const db = require("../lib/connection.js");
module.exports = class CategorizationController {
	constructor(){
		this.uncategorizedSql = "SELECT `transactions`.*\
			FROM `transactions`\
			LEFT JOIN `transaction_categories` ON `transaction_categories`.`transactionId`=`transactions`.id\
			WHERE `transaction_categories`.`id` IS NULL\
			GROUP BY `transactions`.`id` \
			ORDER BY `transactions`.`date`";
	}
	getTestRegex(request,response){
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
				let regex = new RegExp(rule.regex,'i');
				matchingTransactions[rule.categoryId] = Transactions.filter(transaction => regex.exec(transaction.description) !== null);
			}
			return matchingTransactions;
		}).then( transactions => {
			let operations = [];
			for(let Category in transactions) for ( let transaction of transactions[Category]) {
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
		return db.Transaction.findAll({where:{id : request.body.transaction}}).then(result => {
			if(result.length === 0) return Promise.reject({error:true,message:"Transaction does not exist"});
			return db.Category.findAll({where:{id: request.body.category}});
		}).then(result => {
			if(result.length === 0) return Promise.reject({error:true,message:"Category does not exist"});
			return db.TransactionCategory.create({
				categoryId: request.body.category,
				transactionId: request.body.transaction
			})
		}).then(result => {
			response.send(result);
		}).catch(error => {
			response.status(400).send(error);
		});
	}
}