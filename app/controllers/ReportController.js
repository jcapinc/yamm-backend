const Sequelize = require("Sequelize");
const db = require("../lib/connection.js");
module.exports = class ReportController{
	getTotalByMonth(request,response){
		let year = parseInt(request.query.year);
		let month = parseInt(request.query.month);
		if(isNaN(year)) return response.send({error:true,message:"Year is Required"});
		if(isNaN(month))return response.send({error:true,message:"Month is Required"});
		let SumQuery = `\
			SELECT SUM(debit) as debit,SUM(credit) as credit\
			FROM transactions\
			WHERE cast(strftime('%Y',date) AS INT) = ${year} \
			AND cast(strftime('%m',date) AS INT) = ${month}`;
		let SelectQuery = `\
			SELECT *\
			FROM transactions\
			WHERE cast(strftime('%Y',date) AS INT) = ${year} \
			AND cast(strftime('%m',date) AS INT) = ${month}`;
		return db.sequelize.query(SumQuery).spread(SumResult => {
			return new Promise((resolve,reject) => {
				db.sequelize.query(SelectQuery)
					.spread(SelectResult => resolve({
						SumResult,
						transactions: SelectResult.length,
						SelectResult}))
					.catch(error => reject(error));
			});
		}).then( result => {
			return response.send(JSON.stringify(result));
		});
	}

	getTotalByWeek(request,response){
		let year = parseInt(request.query.year);
		let week = parseInt(request.query.week);
		if(isNaN(year)) return response.send({error:true,message:"Year is Required"});
		if(isNaN(week))return response.send({error:true,message:"Week is Required"});
		let SumQuery = `\
			SELECT SUM(debit) as debit,SUM(credit) as credit\
			FROM transactions\
			WHERE cast(strftime('%Y',date) AS INT) = ${year} \
			AND cast(strftime('%W',date) AS INT) = ${week}`;
		let SelectQuery = `\
			SELECT *\
			FROM transactions\
			WHERE cast(strftime('%Y',date) AS INT) = ${year} \
			AND cast(strftime('%W',date) AS INT) = ${week}`;
		return db.sequelize.query(SumQuery).spread(SumResult => {
			return new Promise((resolve,reject) => {
				db.sequelize.query(SelectQuery)
					.spread(SelectResult => resolve({
						SumResult,
						transactions: SelectResult.length,
						SelectResult}))
					.catch(error => reject(error));
			});
		}).then( result => {
			return response.send(JSON.stringify(result));
		});
	}

	getTotalsByMonth(request,response){
		let SumQuery = `\
			SELECT strftime('%Y-%m',date) as month,SUM(debit) as debit,SUM(credit) as credit\
			FROM transactions\
			GROUP BY strftime('%Y-%m',date)`;
		return db.sequelize.query(SumQuery).spread(SumResult => {
			return response.send(SumResult);
		});
	}
	
	getTotalsByWeek(request,response){
		let SumQuery = `\
			SELECT strftime('%Y-%W',date) as week,SUM(debit) as debit,SUM(credit) as credit\
			FROM transactions\
			GROUP BY strftime('%Y-%W',date)`;
		return db.sequelize.query(SumQuery).spread(SumResult => {
			return response.send(SumResult);
		});
	}
}