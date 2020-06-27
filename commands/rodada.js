const Rodada = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);

module.exports = {
	name: 'rodada',
	description: 'Mostra em qual rodada o jogo está',
	async execute(message, args) {
          
            const RodadaAtual = Rodada(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({limit: 1, order: [[ 'createdAt', 'DESC' ]], attributes: ['id_rodada', 'rodada_atual'], raw: true });

            if(rodadaatual){

                message.channel.send(`A rodada atual é: **${rodadaatual[0].rodada_atual}º**`)
            }else{
                return message.channel.send(`blablabla`); 
            }
                       
    },
};