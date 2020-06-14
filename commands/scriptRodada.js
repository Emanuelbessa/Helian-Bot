const Acoes = require('../models/AcoesModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'fecharrodada',
    description: 'Para treinar corretamente digite:\n!fecharrodada  para fechar a rodada',
    async execute(message, args) {
        const { commands } = message.client;
        if (!args.length) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara usar corretamente digite:\n!fecharrodada para fechar a rodada`);
        } else {

            const Acao = Acoes(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);

            var idsrejeitados = [];
            var idsdups = [];
            
            let acoes = await Acao.findAll({ where: { nome_acao: "atacar"}, attributes: ['id_acao', 'tropas', 'rei', 'origem', 'destino', 'nome_acao'], raw: true });


             for (var i = 0; i < acoes.length; i++) {
             var atacante = acoes[i].origem;
             var defensor = acoes[i].destino;
             var id = acoes[i].id_acao;
             var duplicado = 0;

                for (var k = 0; k < acoes.length; k++) {

                    if(atacante == acoes[k].destino){
                        if(!idsrejeitados.includes(id)){
                            idsrejeitados.push(id);
                            break;
                        }
                    }
                    
                    if(defensor == acoes[k].destino ){
                        duplicado = duplicado +1;
                        if(duplicado >= 2){
                            idsdups.push(id);
                            break;
                        }
                    }
                }
             }
            var rejeitados = idsrejeitados.concat(idsdups);

            for (var y = 0; y < rejeitados.length; y++) {
                for(var b = 0; b < acoes.length; b++){
                    if(rejeitados[y] == acoes[b].id_acao){
                    acoes.splice(b, 1);
                    break;
                    }
                }
            }
            
            message.channel.send(`Rodada fechada, os seguintes ataques aconteceram:\n`);
            for (var q = 0; q < acoes.length; q++) {
            
            let territorio = await Territorio.findOne({ where: { localizacao: `${acoes[q].destino}`}, attributes: ['tropas', 'rei'], raw: true });
            
           if(!territorio){
            
            message.channel.send(`O território **${acoes[q].destino}** está vazio e não possui Rei. Você conseguiu consquistar seu PVE safado **${acoes[q].rei}**`);
            continue;
            }

            message.channel.send(`Atacante: **${acoes[q].rei}**, Origem: **${acoes[q].origem}**, Destino: **${acoes[q].destino}**, Defensor: **${territorio.rei}**\n `);
            if(acoes[q].tropas > territorio.tropas){
            message.channel.send(`O vencedor foi **${acoes[q].rei}**, ele conquistou o território: **${acoes[q].destino}**\n`);  
            }else{
            message.channel.send(`As defesas foram o suficiente e o rei: **${territorio.rei}** foi o vencedor\n`);
            }            
            }
            message.channel.send(`Rodada encerrada`);

        }
    },
};