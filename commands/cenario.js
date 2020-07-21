const Territorios = require('../models/TerritorioModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);

module.exports = {
	name: 'cenario',
	description: '---',
	async execute(message, args) {
            
            const Territorio = Territorios(sequelize, Sequelize);

            let todosterritorios = await Territorio.findAll({order: [['rei', 'DESC']], attributes: ['localizacao', 'rei', 'nome_territorio'], raw: true });

            if(todosterritorios){

                message.channel.send(`Os seguintes territórios que possuem Reis conhecidos:\n`);
                
                for(var i = 0;i < todosterritorios.length; i++){
                
                message.channel.send(`Território ${i+1}:\n`)
                message.channel.send(`Território: **${todosterritorios[i].nome_territorio}**; Localização: **${todosterritorios[i].localizacao}**; Rei:${todosterritorios[i].rei} \n`);
                }
                
                /*
                Esses são os Reinos conhecidos:
                Reino: Alderan; Territórios: f8, f9, f10; Rei: Zeldy
                */
                
            }else{
                return message.channel.send(`Você não possui territorios`); 
            }

                       
    },
};