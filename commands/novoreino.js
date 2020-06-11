const Reinos = require('../models/ReinoModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
	name: 'novoreino',
	description: 'Cadastra você como reino',
	mododeusar: 'Para cadastrar corretamente digite:\n!novoreino nomedoreino',
	async execute(message, args) {
		const { commands } = message.client;
		if (!args.length) {
			return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara cadastrar corretamente digite:\n!novoreino nomedoreino`);
		} else {

			const name = args.join(" ");
			const Reino = Reinos(sequelize, Sequelize);
			let temreino = await Reino.findOne({ where: { rei: `${message.author.username}` } });
			if (temreino) {

				return message.channel.send(`Você já possui reino cadastrado`);
			} else {

				Reino.create({
					nome_reino: `${name}`,
					rei: `${message.author.username}`
				});

				return message.channel.send(`Reino cadastrado com sucesso!\nO nome dele é: **${name}**`);
			}
		}
	},
};