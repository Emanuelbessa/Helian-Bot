const Reinos = require('../models/ReinoModel.js');
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
			return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara cadastrar corretamente digite:\n!historia historiadoreino`);
		} else{
			
			const historia = args.join(" ");
			
			const Reino = Reinos(sequelize, Sequelize);
			Reino.update({
				historia: `${historia}`}, {where: {rei: `${message.author.username}`}});
            
            return message.reply(`Historia Atualizada com sucesso`);
			
		}
	},
};