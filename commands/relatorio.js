const Relatorios = require('../models/RelatorioModel.js');
const Rodada = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);

module.exports = {
    name: 'relatorio',
    description: 'Informa o relatório de suas ações e acontecimentos da última rodada',
    async execute(message, args) {

        /*
        Tipos de relatório:
        1. Ataque sem resistencia (PVE)
        2. Ataques PVP sucesso
        3. Ataques PVP falha
        4. Ataques PVP recuando por ser atacado
        5. Ataque PVP recuando por ter outra nação atacando
        6. Defesa PVP sucesso
        7. Defesa PVP falha
        8. Defesa PVP quase ataque 2x+
        9. Defesa PVP quase ataque sem motivo aparente
        10. Tentativa de Apoio - Fui atacado
        11. Apoios Bem sucedidos
        12. Apoios Mal sucedidos
        13. Apoiado
        */

        const Relatorio = Relatorios(sequelize, Sequelize);
        const RodadaAtual = Rodada(sequelize, Sequelize);

        let rodadaatual = await RodadaAtual.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
        var rodadacerta = parseInt(rodadaatual[0].rodada_atual) - 1;
        let seurelatorio = await Relatorio.findAll({ where: { rei: `${message.author.username}`, rodada: rodadacerta }, attributes: ['origem', 'rei', 'destino', 'mensagem', 'rodada'], raw: true });

        console.log(rodadaatual[0].rodada_atual);
        console.log(rodadacerta);
        console.log(seurelatorio);
        console.log(seurelatorio.length);



        if (seurelatorio.length >= 1) {
            message.channel.send(`Meu Rei ${message.author.username}, estes são os relatórios desta rodada:`);
            
            for (var i = 0; i < seurelatorio.length; i++) {
                
                var mensagem = ""

                var tipo1 = seurelatorio.filter(function (a) {
                    return a.mensagem == "1"
                })
                console.log(tipo1)
                if (tipo1.length >= 1) {                  
                    var msg1a = "Fomos informados que os nossos ataques à: "
                    var msg1b = " foram um sucesso pois não havia resistência\n"
                    var locs1 = ""
                    tipo1.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }


                var tipo2 = seurelatorio.filter(function (a) {
                    return a.mensagem == "2"
                })
                if (tipo2.length >= 1) {
                    var msg1a = "Os ataque que fizemos em: "
                    var msg1b = " saíram vencedores no combate\n"
                    var locs1 = ""
                    tipo2.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo3 = seurelatorio.filter(function (a) {
                    return a.mensagem == "3"
                })
                if (tipo3.length >= 1) {
                    var msg1a = "Os ataque que fizemos em: "
                    var msg1b = " falharam em combate, mal sobrevivemos.\n"
                    var locs1 = ""
                    tipo3.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo4 = seurelatorio.filter(function (a) {
                    return a.mensagem == "4"
                })
                if (tipo4.length >= 1) {
                    var msg1a = "Os ataque que fizemos em: "
                    var msg1b = " decidiram ficar na cidade para se defender pois durante a preparação para o ataque, seus batedores avistaram tropas em sua direção.\n"
                    var locs1 = ""
                    tipo4.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo5 = seurelatorio.filter(function (a) {
                    return a.mensagem == "5"
                })
                if (tipo5.length >= 1) {
                    var msg1a = "Os ataque que fizemos em: "
                    var msg1b = " recuaram, pois encontraram outra nação marchando na mesma direção\n"
                    var locs1 = ""
                    tipo5.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo6 = seurelatorio.filter(function (a) {
                    return a.mensagem == "6"
                })
                if (tipo6.length >= 1) {
                    var msg1a = "Nossos territórios em: "
                    var msg1b = " foram atacados e nossas tropas resistiram bravamente.\n"
                    var locs1 = ""
                    tipo6.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo7 = seurelatorio.filter(function (a) {
                    return a.mensagem == "7"
                })
                if (tipo7.length >= 1) {
                    var msg1a = "Fomos atacados e não resistimos nos territórios: "
                    var msg1b = " infelizmente tivemos que abandoná-lo(s).\n"
                    var locs1 = ""
                    tipo7.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo8 = seurelatorio.filter(function (a) {
                    return a.mensagem == "8"
                })
                if (tipo8.length >= 1) {
                    var msg1a = "Foram vistos exércitos de mais de uma nação marchando à: "
                    var msg1b = " mas retornaram devido a presença de outras tropas.\n"
                    var locs1 = ""
                    tipo8.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo9 = seurelatorio.filter(function (a) {
                    return a.mensagem == "9"
                })
                if (tipo9.length >= 1) {
                    var msg1a = "Foram vistos exércitos de uma nação marchando em direção à: "
                    var msg1b = " mas retornaram sem motivo aparente.\n"
                    var locs1 = ""
                    tipo9.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo10 = seurelatorio.filter(function (a) {
                    return a.mensagem == "10"
                })
                if (tipo10.length >= 1) {
                    var msg1a = "Nossas tentativas de apoio em: "
                    var msg1b = " não aconteceram pois nossas tropas tiveram que ficar para lutar\n"
                    var locs1 = ""
                    tipo10.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo11 = seurelatorio.filter(function (a) {
                    return a.mensagem == "11"
                })
                if (tipo11.length >= 1) {
                    var msg1a = "Nossos apoios em: "
                    var msg1b = " foram bem sucedidos\n"
                    var locs1 = ""
                    tipo11.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo12 = seurelatorio.filter(function (a) {
                    return a.mensagem == "12"
                })
                if (tipo12.length >= 1) {
                    var msg1a = "Nossos apoios em: "
                    var msg1b = " foram mal sucedidos em combate\n"
                    var locs1 = ""
                    tipo12.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }

                var tipo13 = seurelatorio.filter(function (a) {
                    return a.mensagem == "13"
                })
                if (tipo13.length >= 1) {
                    var msg1a = "Fomos apoiados em: "
                    var msg1b = " \n"
                    var locs1 = ""
                    tipo13.forEach(function (p, i) {
                        locs1 = locs1 + " " + p.destino
                    })
                    mensagem = mensagem + msg1a + locs1 + msg1b
                }
            }

            return message.channel.send(`${mensagem}`);

        } else {
            return message.channel.send(`Você não agiu e não foi atacado. Não possuimos relatorio para você`);
        }


    },
};