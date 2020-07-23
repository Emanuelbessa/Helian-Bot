const Territorios = require('../models/TerritorioModel.js');
const TerritorioInicial = require('../models/TerritorioInicialModel.js');
const Reinos = require('../models/ReinoModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'territorio',
    description: 'Este comando serve para cadastrar seu primeiro território. Para cadastrar digite !territorio',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length >= 1) {
            return message.channel.send(`Você utilizou esse comando de forma incorreta, ${message.author}!\nPara cadastrar corretamente digite:\n!territorio e o seu território será escolhido aleatoriamente entre as opções iniciais`);
        } else {

            const Inicio = TerritorioInicial(sequelize, Sequelize);

            let possibilidades = await Inicio.findAll({ where: { ocupado: 0 }, attributes: ['localizacao'] });

            if (possibilidades.length >= 1){
                var array = []

                const Reino = Reinos(sequelize, Sequelize);
                const Territorio = Territorios(sequelize, Sequelize);

                possibilidades.forEach(function (nome, indice) {
                    array.push(possibilidades[indice].localizacao)
                })
                var territorioinicial = array[Math.floor(Math.random() * array.length)];

                console.log(territorioinicial)

                let reino = await Reino.findOne({ where: { rei: `${message.author.username}` }, attributes: ['rei', 'nome_reino', 'inicial_conquistado'] });
                console.log(reino)
              
                if (reino) {

                    if(reino.inicial_conquistado == 1){
                        return message.channel.send(`Você já conquistou seu território incial, agora só resta partir para batalha`)
                    }else{

                        Territorio.create({
                            localizacao: `${territorioinicial}`,
                            rei: `${reino.rei}`,
                            nome_territorio: `${reino.nome_reino}`,
                        });
    
                        Inicio.update({
                            ocupado: 1
                        }, {
                            where: { localizacao: `${territorioinicial}` }
                        });

                        Reino.update({
                            inicial_conquistado: 1
                        }, {
                            where: { nome_reino: `${reino.nome_reino}` }
                        });

                        return message.channel.send(`Território conquistado!\nAgora você é o dono de **${territorioinicial}**`)
                    }
 
                } else {

                    return message.channel.send("Você ainda não possui um reino. Primeiro faça o seu reino utilizando o comando !reino nomedoreino")
                }

            } else {

                return message.channel.send(`Todos os territórios iniciais estão ocupados`);
            }
        }
    },
};