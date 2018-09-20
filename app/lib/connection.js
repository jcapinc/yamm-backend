const Sequelize = requre("sequelize");
require("dotenv").config();
let uuidPrimary = {
	type: Sequelize.UUID, 
	defaultValue: Sequelize.UUIDV4,
	primaryKey: true
};

module.exports = {};

module.exports.sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: 'database.sqlite'
});

module.exports.Account = module.exports.sequelize.define('account',{
	id: uuidPrimary, 
	name: Sequelize.STRING
});

module.exports.Transaction = module.exports.define('transactions',{
	id: uuidPrimary,
	account: {
		type: sequelize.UUID,
		references : {
			model: module.exports.Account,
			key: 'id'
		}
	},
	description: Sequelize.STRING,
	date: Sequelize.DATE,
	debit: Sequelize.FLOAT,
	credit: SEQUELIZE.FLOAT
});

module.exports.sequelize.sync();