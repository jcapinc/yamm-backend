const db = require("../lib/connection.js");
const papa = require("papaparse");
const nearley = require("nearley");
const iifGrammer = require("../grammers/iif.js");

module.exports = class InputController{
	postImportFile(req,res){
		// validation
		if(!req.file){
			return res.send(JSON.stringify({
				error: "No file uploaded"
			}),400);
		}

		// parsing and Storage
		let precount = db.Transaction.findAndCountAll().count;
		return this.importRecords(papa.parse(req.file.buffer.toString(),{header: true}).data).then(creationResults => {
			return res.send(JSON.stringify({
				before: precount,
				after: db.Transaction.findAndCountAll().count,
				results: creationResults
			}));
		}).catch(error => {
			res.send(JSON.stringify(error),400);
		});
	}

	importRecords(req){
		return this.getDefaultAccount().then(Account => {
			return Account[0].id;
		}).then(AccountID => {
			let exists = req.map(record => {
				if(!record.Description) return null;
				return this.transactionExists({
					account: AccountID,
					description: record.Description,
					date: new Date(record.Date),
					debit: this.parseDollar(record.Debits),
					credit: this.parseDollar(record.Credits)
				});
			}).filter(record => {
				return record !== null;
			});
			return Promise.all(exists);
		}).then(existingTransactionResults => {
			let finalResults = existingTransactionResults.filter( record => {
				return record.find === null;
			}).map(record => {
				return record.record;
			});
			return db.Transaction.bulkCreate(finalResults);
		});
	}

	transactionExists(record){
		return db.Transaction.find({
			where:{
				description:record.description,
				date: record.date
			}
		}).then(result => {
			return {find: result,record: record};
		});
	}

	getDefaultAccount(){
		let deets = {name: "Checking"};
		return db.Account.findOrCreate({where: deets,defaults:deets});
	}
	
	parseDollar(amount){
		if(amount === null || amount === "") return 0.0;
		return amount.replace("$","").replace(",","") || 0.0;
	}

	postImportIIF(req,res){
		if(!req.file){
			return res.send(JSON.stringify({
				error: "No file uploaded"
			}),400);
		}
		const parser = new nearley.Parser(nearley.Grammar.fromCompiled(iifGrammer));
		parser.feed(req.file.buffer.toString());
		const trxs = parser.results[0].map(record => {
			return {
				transactionid: record.TRNSID,
				description: record.NAME,
				date: new Date(record.DATE),
				debit: parseFloat(record.AMOUNT < 0 ? Math.abs(record.AMOUNT) : 0),
				credit: parseFloat(record.AMOUNT > 0 ? Math.abs(record.AMOUNT) : 0)
			};
		});
		const trxIds = trxs.map( record => record.transactionid);
		const where = {where: {transactionid: {[db.sequelize.Op.in]:trxIds}}};
		db.Transaction.findAll(where).then(result => {
			const ids = result.map(result => result.transactionid)
			const newRecords = trxs.filter(trx => {
				return ids.indexOf(trx.transactionid) === -1;
			});
			if(newRecords.length){
				const chunk_size = 10;
				const methods = Array(Math.ceil(newRecords.length / chunk_size)).fill()
					.map((_, index) => index * chunk_size)
					.map(begin => newRecords.slice(begin, begin + chunk_size))
					.map(chunk => db.Transaction.bulkCreate(chunk));
				return Promise.all(methods);
			}
			return "No records to create";
		}).then(result => res.send({error: false, result}))
			.catch(error => res.send({error: true,message:error}));
	}
}
