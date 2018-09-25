const db = require("../lib/connection.js");
module.exports = class CategorizationController {
	getTestRegex(request,response){
		let regString = request.query.regex;
		let reg = new RegExp(regString);
		return db.Transaction.findAll().then( results => {
			results = results.filter(record => {
				return reg.exec(record.description) !== null;
			});
			response.send(JSON.stringify({data:results,count:results.length}),200);
		});
	}

	getCategories(request,response){
		return db.Category.findAll().then(result => response.send(result));
	}

	postCreateCategory(request,response){
		if(!request.query.name){
			return request.setStatus(400).send({error: true, message:"Name is a required field"});
		}
		let NewCategory = null;
		return db.Category.create({
			name: request.query.name,
			parentId: request.query.parent || null
		}).then(category => {
			if(!request.query.regex) return response.send(category);
			NewCategory = category;
			return db.CategoryRule.create({
				categoryId:category.id,
				regex: request.query.regex
			});
		}).then(categoryRule => {
			response.send({
				category: NewCategory,
				rul: categoryRule
			});
		});
	}
}