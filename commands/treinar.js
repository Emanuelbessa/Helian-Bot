const Territorios = require('../models/TerritorioModel.js');
const Reinos = require('../models/ReinoModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'treinar',
    description: 'Para treinar as tropas corretamente digite:\n!treinar quantidade_de_tropas localização',
    async execute(message, args) {
        const { commands } = message.client;
        if (!args.length) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara treinar corretamente digite:\n!treinar quantidadedetropas localização`);
        } else {

            const ntropas = args[0].toLowerCase();
            const loc = args[1].toLowerCase();

            const Territorio = Territorios(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);

            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${loc}` } });
            let destino = await Territorio.findOne({ where: { localizacao: `${loc}` } });
            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` }, attributes: ['ouro', 'rei', 'nome_reino'], raw: true });

            if (dono) {
                if (ntropas <= reino.ouro) {

                   var novas = destino.tropas + parseInt(ntropas)
                    Reino.update({ ouro: reino.ouro - ntropas }, { where: { rei: `${message.author.username}` } });
                    Territorio.update({ tropas: novas }, { where: { localizacao: `${loc}` } });
                    message.channel.send(`Tropas treinadas com sucesso`);

                } else {

                    return message.channel.send(`Você não possui ouro suficiente`);
                }
            } else{
                return message.channel.send(`O território não é seu`);
            }
        }
    },
};