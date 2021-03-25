
const Reinos = require('../models/ReinoModel.js');
const Rodada = require('../models/RodadaModel.js');
const Cotacoes = require('../models/CotacoesModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
	name: 'cotacao',
	description: 'Cadastra a historia do seu reino',
	mododeusar: 'Para cadastrar corretamente digite:\n!historia historiadoreino',
	async execute(message, args) {
		const { commands } = message.client;
		if (args.length > 0) {
			return message.channel.send(`Comando Removido`);
		} else{

            const RodadaAtual = Rodada(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);
            const Cotacao = Cotacoes(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` } });
            let cotacao = await Cotacao.findOne({ where: { rei: `${message.author.username}`, rodada:  rodadaatual[0].rodada_atual} });
            let cotacao1 = await Cotacao.findOne({ where: { rei: `${message.author.username}`, rodada:  rodadaatual[0].rodada_atual + 1} });


            return message.reply(`A cotação da rodada atual é:\n Ferro: ${cotacao.ferro}\n Madeira: ${cotacao.madeira}\n Tecido: ${cotacao.tecido}\n Óleo: ${cotacao.oleo}\n Trigo: ${cotacao.trigo} \n\n A cotação da proxima rodada é:\n Ferro: ${cotacao1.ferro}\n Madeira: ${cotacao1.madeira}\n Tecido: ${cotacao1.tecido}\n Óleo: ${cotacao1.oleo}\n Trigo: ${cotacao1.trigo}`);
			
		}
	},
};