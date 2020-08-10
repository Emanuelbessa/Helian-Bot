const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Rodada = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'acao',
    description: 'Comando para gerenciar suas ações na rodada, digite !acao ver para verificar suas ações feitas até o momento e !acao apagar para apagar todas',
    async execute(message, args) {
        const { commands } = message.client;
        if (args[0] == 'apagar') {

            const Territorio = Territorios(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({limit: 1, order: [[ 'createdAt', 'DESC' ]], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            var rodadacerta = parseInt(rodadaatual[0].rodada_atual);
           
            let deletar = await Acao.destroy({ where: {rei: `${message.author.username}`, rodada: `${rodadacerta}` }})
           
            if(deletar){               
                return message.channel.send(`Todas as suas ações da rodada atual foram deletadas`);
            }          

        } else if (args[0] == 'ver') {

            const Acao = Acoes(sequelize, Sequelize);
            const RodadaAtual = Rodada(sequelize, Sequelize);

            let rodadaatual = await RodadaAtual.findAll({limit: 1, order: [[ 'createdAt', 'DESC' ]], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            var rodadacerta = parseInt(rodadaatual[0].rodada_atual);
           
            let ver = await Acao.findAll({ where: {rei: `${message.author.username}`, rodada: `${rodadacerta}` }})
            console.log(ver);
        
            if(ver){               

            message.channel.send(`Suas ações da rodada atual são:\n`);
            for(var i = 0;i < ver.length; i++){
                
                message.channel.send(`Ação: **${ver[i].nome_acao}**; Tropas: **${ver[i].tropas}**; Arqueiros: **${ver[i].arqueiros}**; Origem: **${ver[i].origem}**; Destino: **${ver[i].destino}**\n`);
                }
                
            } 
            message.channel.send(`Para apagar suas ações nesta rodada, digite !acao apagar`);
        } else 
        {

            return message.channel.send(`Comando de ação usado de forma incorreta`);
            }
        }
};