const Territorios = require('../models/TerritorioModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);

module.exports = {
	name: 'reino',
	description: 'Mostra todos os territórios do seu reino',
	async execute(message, args) {
            
            const Territorio = Territorios(sequelize, Sequelize);

            let temterritorio = await Territorio.findAll({ where: { rei: `${message.author.username}` }, attributes: ['localizacao', 'rei', 'nome_territorio', 'ouro', 'tropas'], raw: true });

            if(temterritorio){

                message.channel.send(`Você tem os seguintes territórios:\n`);
                
                for(var i = 0;i < temterritorio.length; i++){
                
                message.channel.send(`Território: **${temterritorio[i].nome_territorio}**; Localização: **${temterritorio[i].localizacao}**; Ouro no território: **${temterritorio[i].ouro}**; Tropas no território: **${temterritorio[i].tropas}**\n`);
                }
                
            }else{
                return message.channel.send(`Você não possui territorios`); 
            }

                       
    },
};