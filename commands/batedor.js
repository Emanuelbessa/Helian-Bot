const Reinos = require('../models/ReinoModel.js');
const Mapas = require('../models/MapaModel.js');
const Territorios = require('../models/TerritorioModel.js');
const func = require('./funcoes.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'batedor',
    description: 'Para atacar corretamente digite:\n!atacar origem destino. Todas as tropas do território de origem irão atacar',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length != 3) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nDigite:\n!batedor origem destino1 destino2`);
        } else {

            const origem = args[0].toLowerCase();
            const destino1 = args[1].toLowerCase();
            const destino2 = args[2].toLowerCase();

            const Mapa = Mapas(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);
		
			let reino = await Reino.findOne({ where: { rei: `${message.author.username}` } });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${origem}` } });
            let orig = await Mapa.findOne({ where: { nome_mapa: `${origem}` } });
            let dest1 = await Mapa.findOne({ where: { nome_mapa: `${destino1}` } });
            let dest2 = await Mapa.findOne({ where: { nome_mapa: `${destino2}` } });
            let loc1 = await Territorio.findOne({ where: {localizacao: `${destino1}` } });
            let loc2 = await Territorio.findOne({ where: { localizacao: `${destino2}` } });

            if (reino.ouro < 1) {
                return message.channel.send(`Seu Reino não possui ouro para realizar essa ação`);
            }

            if (dono) {

                if (!func.adjacente(orig.x, orig.y, dest1.x, dest1.y)) {
                    return message.channel.send(`Seu território não está adjacente ao território de destino 1, reveja sua ação`);
                }

                if (!func.adjacente(orig.x, orig.y, dest2.x, dest2.y)) {
                    return message.channel.send(`Seu território não está adjacente ao território de destino 2, reveja sua ação`);
                }

                reino.decrement('ouro')

                if(loc1.tropas > 0){
                    message.channel.send(`O Território de destino 1 possui Bárbaros\n`);
                }else{
                    message.channel.send(`O Território de destino 1 NÃO possui Bárbaros\n`);
                }

                if(loc2.tropas > 0){
                    return message.channel.send(`O Território de destino 2 possui Bárbaros\n`);
                }else{
                    return message.channel.send(`O Território de destino 2 NÃO possui Bárbaros\n`);
                }
            } else {
                return message.channel.send(`O território de origem não é seu`);
            }
        }
    },
};