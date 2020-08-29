const Reinos = require('../models/ReinoModel.js');
const Acoes = require('../models/AcoesModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'transferir',
    description: 'transf',
    async execute(message, args) {
        if (args.length != 2) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nDigite:\n!batedor origem destino1 destino2`);
        } else {
            const dinheiro = args[0]
            const reino_destino = args[1]

            const Reino = Reinos(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);

            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` }, attributes: ['ouro', 'rei', 'nome_reino'], raw: true });

            if (dinheiro > reino.ouro) {
                return message.channel.send(`Você não tem ouro para transferir`);
            } else {
                Acao.create({
                    nome_acao: "transferir",
                    origem: `${reino.nome_reino}`,
                    destino: `${reino_destino}`,
                    rei: `${message.author.username}`,
                    ouro: dinheiro,
                    rodada: `${rodadaatual[0].rodada_atual}`
                });

                return message.channel.send(`Ouro transferido, chegará na proxima rodada`);
            }
        }
    },

};