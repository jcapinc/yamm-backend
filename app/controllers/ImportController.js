const { StringDecoder } = require("string_decoder");
const parser = require("../models/CitizensBankCsvParser.js");

module.exports = class InputController{
	postImportFile(req,res){
		if(!this.file){
			return res.send(JSON.stringify({
				error: "No file uploaded"
			}),400);
		}
		let parse = new parser(req.file.buffer);
		let ret = parse.parseBuffer();
		return res.send(JSON.stringify(res));
	}
}
