const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Rodada = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'acao',
    description: '----',
    async execute(message, args) {
        const { commands } = message.client;
        if (args[0] == 'apagar') {

            const Territorio = Territorios(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({limit: 1, order: [[ 'createdAt', 'DESC' ]], attributes: ['id_rodada', 'rodada_atual'], raw: true });

           
            let deletar = await Acao.destroy({ where: {rei: `${message.author.username}`, rodada: `${rodadaatual[0].rodada_atual}` }})
           
            if(deletar){               
                return message.channel.send(`Todas as suas ações da rodada atual foram deletadas`);
            }          

        } else {
            return message.channel.send(`Usa essa merda direito`);
            }
        }
};