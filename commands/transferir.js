const Reinos = require('../models/ReinoModel.js');
const Acoes = require('../models/AcoesTransferirModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'enviar',
    description: 'transf',
    async execute(message, args) {
        if (args.length != 3) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nDigite:\n!batedor origem destino1 destino2`);
        } else {

            const quantidade = args[0].toLowerCase();
            const recurso = args[1].toLowerCase();
            const reino_destino = args[2]

            const Reino = Reinos(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);

            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` }, attributes: ['nome_reino', 'rei', 'ferro', 'madeira', 'oleo', 'tecido', 'trigo', 'ouro'], raw: true });
            let reinos = await Reino.findAll({ order: [['createdAt', 'DESC']], attributes: ['nome_reino'], raw: true });

            if (reino[recurso] < quantidade) {
                return message.channel.send(`Você não possui essa quantidade do recurso`);
            }

            var todos_reinos = reinos.map(param => param.nome_reino)
            
            if(!todos_reinos.includes(reino_destino)){
                return message.channel.send(`Esse reino não existe`);
            }
            
            var obj = {}
            obj.rei = message.author.username
            obj.reino = reino.nome_reino
            obj.nome_acao = "transferir"
            obj.origem = reino.nome_reino
            obj.destino = reino_destino
            obj[recurso] = quantidade
            obj.rodada = rodadaatual[0].rodada_atual

            Acao.create(obj)

            return message.channel.send(`Recurso transferido, chegará na proxima rodada`);
        }
    },

};