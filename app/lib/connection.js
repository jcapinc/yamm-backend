const Sequelize = require("sequelize");
require("dotenv").config();
let uuidPrimary = {
	type: Sequelize.UUID, 
	defaultValue: Sequelize.UUIDV4,
	primaryKey: true
};

let sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: 'database.sqlite'
});

let Account = sequelize.define('account',{
	id: uuidPrimary, 
	name: Sequelize.STRING
});

let Transaction = sequelize.define('transactions',{
	id: uuidPrimary,
	account: {type: Sequelize.UUID,references : {model: Account,key: 'id'}},
	description: Sequelize.STRING,
	date: Sequelize.DATE,
	debit: Sequelize.FLOAT,
	credit: Sequelize.FLOAT
},{uniqueKeys: {unique_transaction: true,fields: ['date','description','debit','credit']}});

let Categories = sequelize.define('categories',{
	id: uuidPrimary,
	name: Sequelize.STRING,
	regex: Sequelize.STRING,
	parent: Sequelize.UUID
});

let TransactionCategories = sequelize.define('transaction_categories',{
	id:uuidPrimary,
	transaction: {type: Sequelize.UUID,references: {model: Transaction,key: 'id'}},
	category: {type: Sequelize.UUID,references: {model:Categories,key: 'id'}}
},{uniqueKeys:{ unique_categorization: {fields:['transaction','category']}}});
sequelize.sync();

module.exports = {sequelize,Account,Transaction,Categories,TransactionCategories};