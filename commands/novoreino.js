const func = require('./funcoes.js');
const Reinos = require('../models/ReinoModel.js');
const Cotacoes = require('../models/CotacoesModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const rodada = require('./rodada.js');
const sequelize = new Sequelize(config);
module.exports = {
	name: 'novoreino',
	description: 'Cadastra você como reino. Digite !novoreino nome_do_reino',
	mododeusar: 'Digite:\n!novoreino nomedoreino',
	async execute(message, args) {
		const { commands } = message.client;
		if (!args.length) {
			return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara cadastrar corretamente digite:\n!novoreino nomedoreino`);
		} else if (func.isValid(args.join(" "))) {

			const name = args.join(" ");
			const Reino = Reinos(sequelize, Sequelize);
			const Cotacao = Cotacoes(sequelize, Sequelize);
			//Impedir jogador de começar após primeira rodada?
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
				for (let i = 0; i < 2; i++) {
					var pesos = [...func.gerarCotacoesRecursos(10, 4, 5), 0]
					var recursos = ['ferro', 'madeira', 'tecido', 'oleo', 'trigo']
					var qtdRecursos = recursos.length
					var obj = {}

					for (let i = 0; i < qtdRecursos; i++) {

						var recurso = recursos[Math.floor(Math.random() * recursos.length)];
						var recursos = recursos.filter(function (value, index, arr) { return value !== recurso; });

						var peso = pesos[Math.floor(Math.random() * pesos.length)];
						var index = pesos.indexOf(peso)
						if (index > -1) {
							pesos.splice(index, 1)
						}
						obj[recurso] = peso
					}
					obj.rei = message.author.username
					obj.reino = name
					obj.rodada = i+1
					const test = await Cotacao.create(obj)
				}


				return message.channel.send(`Reino conquistado com sucesso!\nO nome dele é: **${name}**`);
			}
		} else {
			return message.channel.send(`Você utilizou esse comando de forma incorreta`);
		}
	},
};