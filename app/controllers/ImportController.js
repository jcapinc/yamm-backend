const Transaction = require("../models/Transaction.js");

module.exports = class InputController{
	postImportFile(req,res){
		// validation
		if(!req.file){
			return res.send(JSON.stringify({
				error: "No file uploaded"
			}),400);
		}

		// parsing
		let parsed = papa.parse(req.file.buffer.toString(),{header: true});

		// storage
		let creationResult = Transaction.createMultiple(parsed);

		// reporting
		return res.send(JSON.stringify(creationResult));
	}
}
