const Reinos = require('../models/ReinoModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
	name: 'novoreino',
	description: 'Cadastra você como reino. Digite !novoreino nome_do_reino',
	mododeusar: 'Digite:\n!novoreino nomedoreino',
	async execute(message, args) {
		const { commands } = message.client;
		if (!args.length) {
			return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara cadastrar corretamente digite:\n!novoreino nomedoreino`);
		} else {

			const name = args.join(" ");
			const Reino = Reinos(sequelize, Sequelize);
		
			let temreino = await Reino.findOne({ where: { rei: `${message.author.username}` } });

			if (temreino) {
				return message.channel.send(`Você já é dono de um Reino`);
			} else {

				Reino.create({
					nome_reino: `${name}`,
					rei: `${message.author.username}`,
					ouro: 10,
					inicial_conquistado: 0
				});

				return message.channel.send(`Reino conquistado com sucesso!\nO nome dele é: **${name}**`);
			}


		}
	},
};