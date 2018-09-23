const db = require("../lib/connection.js");
const papa = require("papaparse");
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
		return this.importRecords(req).then(creationResults => {
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
			let exists = papa.parse(req.file.buffer.toString(),{header: true}).data.map(record => {
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
}
