const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
	name: 'historia',
	description: 'Cadastra a historia do seu reino',
	mododeusar: 'Para cadastrar corretamente digite:\n!historia historiadoreino',
	execute(message, args) {
		const { commands } = message.client;
		if (!args.length) {
			return message.channel.send(`Comando Removido`);
		} else{

            return message.reply(`Comando Removido`);
			
		}
	},
};