const Sequelize = require("sequelize");
require("dotenv").config();
const uuidPrimary = {
	type: Sequelize.UUID, 
	defaultValue: Sequelize.UUIDV4,
	primaryKey: true
};

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: 'database.sqlite'
});

const Account = sequelize.define('accounts',{
	id: uuidPrimary, 
	name: Sequelize.STRING
});

const Transaction = sequelize.define('transactions',{
	id: uuidPrimary,
	description: Sequelize.STRING,
	date: Sequelize.DATE,
	debit: Sequelize.FLOAT,
	credit: Sequelize.FLOAT
},{uniqueKeys: {unique_transaction: true,fields: ['date','description','debit','credit']}});
Transaction.hasOne(Account);

const Category = sequelize.define('categories',{
	id: uuidPrimary,
	name: Sequelize.STRING,
});
Category.belongsTo(Category,{as:"parent"});
Transaction.belongsToMany(Category,{
	through:'transaction_categories',
	as: 'categories'
});

const TransactionCategory = sequelize.define('transaction_categories',{
	id:uuidPrimary,
	transactionId: {type: Sequelize.UUID,references: {model: Transaction,key: 'id'}},
	categoryId: {type: Sequelize.UUID,references: {model:Category,key: 'id'}}
},{uniqueKeys:{ unique_categorization: {fields:['transaction','category']}}});

TransactionCategory.belongsTo(Category);

const CategoryRule = sequelize.define("category_rules",{
	id:uuidPrimary,
	regex:Sequelize.STRING
});
CategoryRule.belongsTo(Category);
Category.hasMany(CategoryRule);

sequelize.sync();
module.exports = {
	sequelize,
	Account,
	Transaction,
	Category,
	TransactionCategory,
	CategoryRule
};