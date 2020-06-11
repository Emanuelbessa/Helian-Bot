const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'fecharrodada',
    description: 'Para treinar corretamente digite:\n!fecharrodada  para fechar a rodada',
    async execute(message, args) {
        const { commands } = message.client;
        if (!args.length) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara usar corretamente digite:\n!fecharrodada  para fechar a rodada`);
        } else {

            const Acao = Acoes(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            let origens = []
            var destinos = []

            // FALTA CONSERTAR AS VERIFICAÇÕES E FAZER OS CHECKS DOS ATK'S
            
            let acoes = await Acao.findAll({ where: { nome_acao: "atacar"}, attributes: ['tropas', 'rei', 'origem', 'destino', 'nome_acao'], raw: true });
           
            console.log(acoes);
            /*console.log(acao[0]);
            console.log(acao[0].tropas);
            console.log(acao);*/
        }
    },
};