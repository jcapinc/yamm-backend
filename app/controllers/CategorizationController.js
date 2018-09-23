let db = require("../lib/connection.js");
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

	postCreateCategory(request,response){
		
	}
}