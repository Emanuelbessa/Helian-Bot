const Territorios = require('../models/TerritorioModel.js');
const TerritorioInicial = require('../models/TerritorioInicialModel.js');
const func = require('./funcoes.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);

module.exports = {
    name: 'iniciar',
    description: '',
    async execute(message, args) {
        const { commands } = message.client;
        if (message.author.username != "Emanuel") {
            return message.channel.send('Você não tem permissão para usar o comando')
        } else {

            const Inicio = TerritorioInicial(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);

            //Todos os Territórios que Podem servir como inicial
            var Todos_Iniciais = ['21', '22', '23', '24', '25', '35', '36', '47', '56', '66', '65', '64', '63', '52', '51', '50', '41', '31']
            //Todos os Territórios Habitáveis do mapa
            var Todos_Territorios = ['11', '21', '22', '23', '24', '25', '31', '32', '33', '34', '35', '36', '37', '41', '42', '43', '44', '45', '46', '47', '50', '51', '52', '53', '54', '55', '56', '61', '63', '64', '65', '66', '73'];
            //Todos os Territorios Especiais
            var especiais = ['43', '44']
            //Quantidade de Tropas de barbaros possiveis dentro do territórios vazio
            var tropas = [0, 1, 0, 2, 0, 3]
            //N de jogadores iniciais
            var nJogadores = 4

            var Terr_Inicio = func.territoriosIniciais(Todos_Iniciais, nJogadores)

            if (Terr_Inicio.length == nJogadores) {

                Terr_Inicio.forEach(function (el, i) {
                    var x = parseInt(el.split('')[0])
                    var y = el.split('')[1]
                    loca = func.numerosParaLetras(x, y)

                    Inicio.create({
                        localizacao: `${loca}`,
                        ocupado: 0
                    });
                })
            } else {
                return message.channel.send(`Comando não conseguiu encontrar territórios suficientes para todos os jogadores, tente novamente`)
            }


            barbaros = Todos_Territorios.filter(function (el) {
                return Terr_Inicio.indexOf(el) < 0;
            });

            barbaros = barbaros.filter(function (el) {
                return especiais.indexOf(el) < 0;
            });

            barbaros.forEach(function (el, i) {
                var tropa = tropas[Math.floor(Math.random() * tropas.length)];
                var x = parseInt(el.split('')[0])
                var y = el.split('')[1]
                loca = func.numerosParaLetras(x, y)

                Territorio.create({
                    localizacao: `${loca}`,
                    rei: `Natureza`,
                    nome_territorio: `Natureza`,
                    tropas: `${tropa}`
                });
            })

            especiais.forEach(function (el, i) {
                var tropa = func.randomMinMax(15, 25)
                var x = parseInt(el.split('')[0])
                var y = el.split('')[1]
                loca = func.numerosParaLetras(x, y)

                Territorio.create({
                    localizacao: `${loca}`,
                    rei: `Natureza`,
                    nome_territorio: `Natureza`,
                    tropas: `${tropa}`
                });
            })
            console.log(Terr_Inicio);
            return message.channel.send(`Setup inicial feito com sucesso, partiu jogar`)
        }
    }
}