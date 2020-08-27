const func = require('./funcoes.js');
const Acoes = require('../models/AcoesModel.js');
const Mapas = require('../models/MapaModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Reinos = require('../models/ReinoModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
module.exports = {
    name: 'barco',
    description: '--',
    async execute(message, args) {
        const { commands } = message.client;
        if (args.length > 3) {
            console.log(args.length);
            return message.channel.send(`Você utilizou esse comando de forma incorreta------`);
        } else if (args[0] == 'construir') {

            const lugar = args[1].toLowerCase();
            const mar = args[2].toLowerCase();

            const Mapa = Mapas(sequelize, Sequelize);
            const Acao = Acoes(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);

            let reino = await Reino.findOne({ where: { rei: `${message.author.username}` } });
            let dono = await Territorio.findOne({ where: { rei: `${message.author.username}`, localizacao: `${lugar}` } });
            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            let acao = await Acao.findOne({ where: { rei: `${message.author.username}`, origem: `${lugar}`, rodada: `${rodadaatual[0].rodada_atual}` } });
            let terr = await Mapa.findOne({ where: { nome_mapa: `${lugar}` } });

            const embed = {
                "title": ":hammer: Ação de construir barco registrada :hammer:",
                "description": "Sua ação de construção de barco foi registrada com sucesso, essa ação demora 1 rodada para ser concluída. ```\nLembre-se que você ver as suas ações da rodada atual com o comando !acao ver, e apagar todas elas com !acao apagar```",
                "color": 65280,
                "timestamp": + new Date(),
                "footer": {
                    "text": "Ação registrada em"
                },
                "thumbnail": {
                    "url": "https://i.ytimg.com/vi/pKArytW4hBM/hqdefault.jpg"
                },
                "image": {
                    "url": "https://coolvibe.com/wp-content/uploads/2011/01/carlsonwkk-place-of-making-ship-992x558.jpg"
                },
                "fields": [
                    {
                        "name": ":map: Território utilizado para construção :map:",
                        "value": `**${args[1]}**`
                    },
                    {
                        "name": "Custo :moneybag: ",
                        "value": `**${reino.custo_barco}**`
                    },
                    {
                        "name": ":ocean: Mar de destino :ocean: ",
                        "value": `**${args[2]}**`
                    }
                ]
            };

            if (acao) {
                return message.channel.send(`Já existe uma ação registrada para esse territorio, espere a rodada acabar ou apague suas ações`);
            }

            if (reino.ouro < reino.custo_barco) {
                return message.channel.send(`Você não tem ouro para construir o barco`);
            }

            if (dono) {
                if (terr.nome_mar.split(',').includes(mar)) {
                    // Gasto de ouro e aumento do custo não é feito nesse momento pois existe a possibilidade de cancelar a ação
                    //reino.decrement('ouro', { by: reino.custo_barco })
                    //reino.increment('custo_barco', { by: 2 })
                    Acao.create({
                        nome_acao: "construir",
                        origem: `${lugar}`,
                        destino: `${mar}`,
                        rei: `${message.author.username}`,
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                    return message.channel.send({ embed });
                } else {
                    return message.channel.send(`O mar não está adjacente ao território selecionado`);
                }
            } else {
                return message.channel.send(`Você não possui recursos suficiente ou o territorio não é seu`);
            }
        } else {
            return message.channel.send(`Comando utilizado de forma incorreta`);
        }
    },
};