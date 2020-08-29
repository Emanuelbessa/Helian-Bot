const Territorios = require('../models/TerritorioModel.js');
const Reinos = require('../models/ReinoModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const reino = require('./reino.js');
const sequelize = new Sequelize(config);

module.exports = {
    name: 'cenario',
    description: 'Comando que lhe informa tudo que é conhecido sobre os outros reinos. Barcos só ficam visíveis por quem possui território no litoral daquele mar.',
    async execute(message, args) {

        const Territorio = Territorios(sequelize, Sequelize);
        const Reino = Reinos(sequelize, Sequelize);

        let todosterritorios = await Territorio.findAll({ order: [['rei', 'DESC']], attributes: ['localizacao', 'rei', 'nome_territorio'], raw: true });
        let reinos = await Reino.findAll({ order: [['rei', 'DESC']], attributes: ['rei', 'nome_reino'], raw: true });

        message.channel.send(`Esses são os Reinos conhecidos:\n`);

        for (var i = 0; i < reinos.length; i++) {

            var nomes = ""

            var filtrados = todosterritorios.filter(function(a){
                return a.rei == reinos[i].rei
            })

            filtrados.forEach(function (p, i) {
                nomes = nomes + " " + "- "+  p.localizacao 
            })

            message.channel.send(`Reino: **${reinos[i].nome_reino}**; Territórios: **${nomes}**; Rei: **${reinos[i].rei}**\n`);
        }
    },
};