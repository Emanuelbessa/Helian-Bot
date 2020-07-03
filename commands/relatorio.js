const Relatorios = require('../models/RelatorioModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);

module.exports = {
	name: 'relatorio',
	description: '---',
	async execute(message, args) {
            
            const Relatorio = Relatorios(sequelize, Sequelize);

            let seurelatorio = await Relatorio.findAll({ where: { rei: `${message.author.username}` }, attributes: ['origem', 'rei', 'destino', 'mensagem'], raw: true });

            if(seurelatorio){

                message.channel.send(`Temos as seguintes mensagens da ultima rodada:\n`);
                
                for(var i = 0;i < seurelatorio.length; i++){
                
                message.channel.send(`Mensagem nº ${i+1}:\n`)
                message.channel.send(`Território de Origem: **${seurelatorio[i].origem}**; Território de Destino: **${seurelatorio[i].destino}**\n`);
                message.channel.send(`Mensagem:\n**${seurelatorio[i].mensagem}**`);    
            }
                
            }else{
                return message.channel.send(`Você não agiu e não foi atacado. Não possuimos relatorio para você`); 
            }

                       
    },
};