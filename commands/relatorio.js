const Relatorios = require('../models/RelatorioModel.js');
const Rodada = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);

module.exports = {
	name: 'relatorio',
	description: '---',
	async execute(message, args) {
            
            const Relatorio = Relatorios(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({limit: 1, order: [[ 'createdAt', 'DESC' ]], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            var rodadacerta = parseInt(rodadaatual[0].rodada_atual)-1;
            let seurelatorio = await Relatorio.findAll({ where: { rei: `${message.author.username}`, rodada: rodadacerta }, attributes: ['origem', 'rei', 'destino', 'mensagem', 'rodada'], raw: true });

            if(seurelatorio){

                message.channel.send(`Temos as seguintes mensagens da ultima rodada:\n`);
                
                for(var i = 0;i < seurelatorio.length; i++){
                
                message.channel.send(`Território de Origem: **${seurelatorio[i].origem}**; Território de Destino: **${seurelatorio[i].destino}**\n`);
                message.channel.send(`**${seurelatorio[i].mensagem}**`);    
            }
                
            }else{
                return message.channel.send(`Você não agiu e não foi atacado. Não possuimos relatorio para você`); 
            }

                       
    },
};