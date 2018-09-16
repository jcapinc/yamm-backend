const { StringDecoder } = require("string_decoder");
const parser = require("../models/CitizensBankCsvParser.js");

module.exports = class InputController{
	postImportFile(req,res){
		let parse = new parser(req.file.buffer);
		let ret = [];
		for( let line of parse){
			ret.push(line);
		}
		return res.send(JSON.stringify(res));
	}
}