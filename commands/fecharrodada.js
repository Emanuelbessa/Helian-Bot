const func = require('./funcoes.js');
const Acoes = require('../models/AcoesModel.js');
const AcoesBarco = require('../models/AcoesBarcoModel.js');
const Barcos = require('../models/BarcosModel.js');
const Territorios = require('../models/TerritorioModel.js');
const Mapas = require('../models/MapaModel.js');
const Reinos = require('../models/ReinoModel.js');
const Relatorios = require('../models/RelatorioModel.js');
const Rodadas = require('../models/RodadaModel.js');
const Sequelize = require('sequelize');
const config = require('../database');
const sequelize = new Sequelize(config);
const { Op } = require("sequelize")
module.exports = {
    name: 'fecharrodada',
    description: 'Digite: !fecharrodada  para fechar a rodada. Atenção! Você provavelmente não tem autorização para isso.',
    async execute(message, args) {
        const { commands } = message.client;
        if (message.author.username != "Emanuel") {
            return message.channel.send('Você não tem permissão para usar o comando')
        } else {

            const Acao = Acoes(sequelize, Sequelize);
            const Reino = Reinos(sequelize, Sequelize);
            const Territorio = Territorios(sequelize, Sequelize);
            const Relatorio = Relatorios(sequelize, Sequelize);
            const Rodada = Rodadas(sequelize, Sequelize);
            const AcaoBarco = AcoesBarco(sequelize, Sequelize);
            const Barco = Barcos(sequelize, Sequelize);
            const Mapa = Mapas(sequelize, Sequelize);

            let todos_reinos = await Reino.findAll({ order: [['rei', 'DESC']], attributes: ['rei', 'nome_reino'], raw: true });
            let rodadaatual = await Rodada.findAll({ limit: 1, order: [['createdAt', 'DESC']], attributes: ['id_rodada', 'rodada_atual'], raw: true });
            var acoes = await Acao.findAll({ where: { nome_acao: ['atacar', 'apoiar'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'apoio', 'tropas', 'arqueiros', 'rei', 'origem', 'destino'], raw: true });
            var coletas = await Acao.findAll({ where: { nome_acao: ['coletar'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'rei', 'origem'], raw: true });
            var construcao = await Acao.findAll({ where: { nome_acao: ['construir'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'rei', 'origem', 'destino'], raw: true });
            var atacar_barco = await AcaoBarco.findAll({ where: { nome_acao: ['atacar_barco'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'apoio', 'tropas', 'arqueiros', 'rei', 'origem', 'destino'], raw: true });
            var usar_barco_ataque = await AcaoBarco.findAll({ where: { nome_acao: ['usar_barco_ataque'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'apoio', 'tropas', 'arqueiros', 'rei', 'origem', 'destino'], raw: true });
            var usar_barco_apoio = await AcaoBarco.findAll({ where: { nome_acao: ['usar_barco_apoio'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'apoio', 'tropas', 'arqueiros', 'rei', 'origem', 'destino'], raw: true });
            var transferencia = await Acao.findAll({ where: { nome_acao: ['transferir'], rodada: `${rodadaatual[0].rodada_atual}` }, attributes: ['id_acao', 'nome_acao', 'apoio', 'tropas', 'arqueiros', 'rei', 'origem', 'destino', 'ouro'], raw: true });

            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];
            var MotivoA = []; // Atacar e Defender
            var MotivoB = []; // 2x No mesmo território
            var MotivoC = []; // Tentativa de Apoio falhou
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

            //- Conclusão de ações que não são canceladas
            for (let i = 0; i < construcao.length; i++) {
                let reino = await Reino.findOne({ where: { rei: `${construcao[i].rei}` }, attributes: ['nome_reino', 'rei', 'custo_barco'], raw: true });
                if(reino.ouro < reino.custo_barco){
                    continue
                }
                Reino.decrement('ouro', { by: reino.custo_barco, where: { nome_reino: reino.nome_reino } });
                Reino.increment('custo_barco', { by: 1, where: { nome_reino: reino.nome_reino } });

                Barco.create({
                    nome_rei: `${construcao[i].rei}`,
                    nome_reino: `${reino.nome_reino}`,
                    nome_mar: `${construcao[i].destino}`,
                });
            }

            for (let i = 0; i < transferencia.length; i++) {
                let reino = await Reino.findOne({ where: { nome_reino: `${transferencia[i].destino}` }, attributes: ['nome_reino', 'rei', 'custo_barco', 'ouro'], raw: true });
                console.log(reino);
                Reino.decrement('ouro', { by: transferencia[i].ouro, where: { rei: transferencia[i].rei } });
                Reino.increment('ouro', { by: transferencia[i].ouro, where: { nome_reino: reino.nome_reino } });
            }
            //- Realizar ataques contra barcos
            /*
            for (let i = 0; i < atacar_barco.length; i++) {
                for (let k = 0; k < array.length; k++) {
                }
            }
            */
            usar_barco_ataque.forEach(function (el, i) {
                el.nome_acao = 'atacar'
                acoes.push(el)
            })

            usar_barco_apoio.forEach(function (el, i) {
                el.nome_acao = 'apoiar'
                acoes.push(el)
            })

            for (var i = 0; i < acoes.length; i++) {

                if (acoes[i].nome_acao == 'atacar') {
                    ATACANTES.push(acoes[i].origem);
                    DEFENSORES.push(acoes[i].destino);
                }
                if (acoes[i].nome_acao == 'apoiar') {

                    APOIADOR.push(acoes[i].origem);
                    APOIADO.push(acoes[i].destino);
                }
            }
            // Testando quem vai cair no MotivoA para depois testar o MotivoB
            for (var i = 0; i < acoes.length; i++) {
                if (ATACANTES.includes(acoes[i].origem) && DEFENSORES.includes(acoes[i].origem)) {
                    MotivoA.push(acoes[i]);
                }
            }
            // Criando os Relatórios do Motivo A
            for (let i = 0; i < MotivoA.length; i++) {
                let territo = await Territorio.findOne({ where: { localizacao: `${MotivoA[i].destino}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });
                // Ataques PVP recuando por ser atacado
                Relatorio.create({
                    rei: `${MotivoA[i].rei}`,
                    origem: `${MotivoA[i].origem}`,
                    destino: `${MotivoA[i].destino}`,
                    mensagem: '4',
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                // Defesa PVP quase ataque sem motivo aparente
                if (territo) {
                    Relatorio.create({
                        rei: `${territo.rei}`,
                        origem: `${MotivoA[i].origem}`,
                        destino: `${MotivoA[i].destino}`,
                        mensagem: '9',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                }

            }
            console.log("Ponto 1");
            // Removendo ações invalidadas pelo motivo A do Array de acoes
            acoes = acoes.filter(function (el, i) {
                return MotivoA.indexOf(el) < 0
            })
            console.log("Ponto 2");

            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];

            for (var i = 0; i < acoes.length; i++) {
                if (acoes[i].nome_acao == 'atacar') {
                    ATACANTES.push(acoes[i].origem);
                    DEFENSORES.push(acoes[i].destino);
                }
                if (acoes[i].nome_acao == 'apoiar') {
                    APOIADOR.push(acoes[i].origem);
                    APOIADO.push(acoes[i].destino);
                }
            }

            // Começando fase de testes do Motivo B
            let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)

            var defensorduplicado = findDuplicates(DEFENSORES)

            for (var i = 0; i < acoes.length; i++) {
                for (var k = 0; k < defensorduplicado.length; k++) {
                    if (acoes[i].destino == defensorduplicado[k]) {
                        MotivoB.push(acoes[i])
                    }
                }
            }
            // Criando os Relatórios do Motivo B
            for (let i = 0; i < MotivoB.length; i++) {
                let territorio = await Territorio.findOne({ where: { localizacao: `${MotivoB[i].destino}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });
                // Ataque PVP recuando por ter outra nação atacando
                Relatorio.create({
                    rei: `${MotivoB[i].rei}`,
                    origem: `${MotivoB[i].origem}`,
                    destino: `${MotivoB[i].destino}`,
                    mensagem: '5',
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
                // Defesa PVP quase ataque 2x+
                if (territorio) {
                    Relatorio.create({
                        rei: `${territorio.rei}`,
                        origem: `${MotivoB[i].origem}`,
                        destino: `${MotivoB[i].destino}`,
                        mensagem: '8',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                }

            }
            console.log("Ponto 3");
            // Removendo ações invalidadas pelo motivo B do Array de acoes
            acoes = acoes.filter(function (el, i) {
                return MotivoB.indexOf(el) < 0
            })
            console.log("Ponto 4");


            var app = acoes.filter(function (a) {
                return a.nome_acao == 'atacar'
            })
            var apoios = acoes.filter(function (a) {
                return a.nome_acao == 'apoiar'
            })
            console.log("Ponto teste");
            //Testando quem vai cair no Motivo C
            for (var i = 0; i < app.length; i++) {
                for (var k = 0; k < apoios.length; k++) {
                    if (app[i].destino == apoios[k].origem) {
                        MotivoC.push(apoios[k])
                    }
                }
            }
            console.log("Ponto teste2");
            // Criando os Relatórios do Motivo C
            for (let i = 0; i < MotivoC.length; i++) {
                // Tentativa de Apoio Falha - Fui atacado
                Relatorio.create({
                    rei: `${MotivoC[i].rei}`,
                    origem: `${MotivoC[i].origem}`,
                    destino: `${MotivoC[i].destino}`,
                    mensagem: '10',
                    rodada: `${rodadaatual[0].rodada_atual}`
                });
            }
            console.log("Ponto 5");
            // Removendo ações invalidadas pelo motivo C do Array de acoes
            acoes = acoes.filter(function (el) {
                return MotivoC.indexOf(el) < 0;
            });
            console.log("Ponto 6");

            var apoiadores = acoes.filter(function (a) {
                return a.nome_acao == 'apoiar'
            });

            var ATACANTES = [];
            var DEFENSORES = [];
            var APOIADOR = [];
            var APOIADO = [];
            console.log("Ponto 7");
            for (var i = 0; i < acoes.length; i++) {

                if (acoes[i].nome_acao == 'atacar') {
                    ATACANTES.push(acoes[i].origem);
                    DEFENSORES.push(acoes[i].destino);
                }
                if (acoes[i].nome_acao == 'apoiar') {

                    APOIADOR.push(acoes[i].origem);
                    APOIADO.push(acoes[i].destino);
                }
            }

            console.log("Ponto 8");
            // Se o destino do apoio não é origem ou destino de um ataque, bem sucedido / apoiado
            // A conquista PVE deve ser parte do for do PVP, pois existe a possiblidade de alguém apoiar o território vazio

            for (let i = 0; i < apoiadores.length; i++) {
                if (!DEFENSORES.includes(apoiadores[i].destino)) {
                    let sup = await Territorio.findOne({ where: { localizacao: `${apoiadores[i].destino}` }, attributes: ['localizacao', 'rei'], raw: true });
                    Relatorio.create({
                        rei: `${apoiadores[i].rei}`,
                        origem: `${apoiadores[i].origem}`,
                        destino: `${apoiadores[i].destino}`,
                        mensagem: '11',
                        rodada: `${rodadaatual[0].rodada_atual}`
                    });
                    if (sup) {
                        Relatorio.create({
                            rei: `${sup.rei}`,
                            origem: `${apoiadores[i].origem}`,
                            destino: `${apoiadores[i].destino}`,
                            mensagem: '13',
                            rodada: `${rodadaatual[0].rodada_atual}`
                        });
                    }

                }
            }
            var atacantes = acoes.filter(function (a) {
                return a.nome_acao == 'atacar'
            });
            //
            console.log("Ponto 9");


            // PVPs que de fato aconteceram
            for (let i = 0; i < acoes.length; i++) {
                if (acoes[i].nome_acao == 'atacar') {
                    var terr = await Territorio.findOne({ where: { localizacao: acoes[i].destino }, attributes: ['localizacao', 'tropas', 'arqueiros', 'rei'], raw: true });

                    var ataque = acoes[i].tropas + acoes[i].arqueiros
                    if (terr) {
                        var defesa = terr.tropas + (terr.arqueiros * 3)
                    } else {
                        var defesa = 0
                    }
                    var apoioatk = false
                    var apoiodef = false

                    if (APOIADO.includes(acoes[i].destino)) {

                        var auxatq = apoiadores.filter(function (a) {
                            return a.apoio === "ataque" && a.destino == acoes[i].destino
                        });
                        console.log(auxatq);
                        var auxdef = apoiadores.filter(function (a) {
                            return a.apoio === "defesa" && a.destino == acoes[i].destino
                        });
                        console.log(auxdef);
                        if (auxatq.length >= 1) {
                            var a = 0
                            auxatq.forEach(function (t, indice) {
                                a = a + t.tropas
                            })
                            //add força dos arqueiros no atk (1)
                            auxatq.forEach(function (t, indice) {
                                a = a + t.arqueiros
                            })

                            ataque = ataque + a
                            apoioatk = true
                        }

                        if (auxdef.length >= 1) {
                            var d = 0
                            auxdef.forEach(function (t, indice) {
                                d = d + t.tropas
                            })

                            auxdef.forEach(function (t, indice) {
                                d = d + (t.arqueiros * 3)
                            })

                            defesa = defesa + d
                            apoiodef = true
                        }
                    }

                    if (ataque > defesa) {
                        if (terr.rei == 'Natureza') {
                            // Primeiro Caso de ataque Bem sucedido, PVE
                            Relatorio.create({
                                rei: `${acoes[i].rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '1',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                            let terr2 = await Territorio.findOne({ where: { localizacao: `${acoes[i].origem}` }, attributes: ['localizacao', 'tropas', 'rei', 'nome_territorio'], raw: true });
                            Territorio.update({
                                rei: `${acoes[i].rei}`,
                                nome_territorio: `${terr2.nome_territorio}`,
                                tropas: `0`,
                                arqueiros: `0`
                            }, {
                                where: { localizacao: `${acoes[i].destino}` }
                            });
                            //Diminuir Tropas de acordo com o ataque à natureza
                            Territorio.update({
                                tropas: acoes[i].tropas - terr.tropas,
                                arqueiros: `0`
                            }, {
                                where: { localizacao: `${acoes[i].origem}` }
                            });
                            Reino.increment('ouro', { by: 6, where: { nome_reino: `${terr2.nome_territorio}` } });

                        } else {
                            Relatorio.create({
                                rei: `${acoes[i].rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '2',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                            Relatorio.create({
                                rei: `${terr.rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '7',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                        }
                        //Criando o Relatório para as pessoas que defenderam e zerando suas tropas (lado perdedor)
                        if (apoiodef) {
                            auxdef.forEach(function (t, indice) {
                                if (terr) {
                                    Relatorio.create({
                                        rei: `${terr.rei}`,
                                        origem: `${t.origem}`,
                                        destino: `${acoes[i].destino}`,
                                        mensagem: '13',
                                        rodada: `${rodadaatual[0].rodada_atual}`
                                    });
                                }
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '12',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })
                            auxdef.forEach(function (v, i) {
                                Territorio.update({
                                    tropas: `0`,
                                    arqueiros: `0`

                                }, {
                                    where: { localizacao: `${v.origem}` }
                                });
                            })
                        }
                        //Mudando o Rei do território para o nome do rei vencedor
                        Territorio.update({
                            rei: `${acoes[i].rei}`,
                            tropas: `0`,
                            arqueiros: `0`,
                        }, {
                            where: { localizacao: `${acoes[i].destino}` }
                        });
                        //Criando o Relatório para as pessoas que ajudaram a atacar e reduzindo suas tropas (lado vencedor)
                        if (apoioatk) {
                            auxatq.forEach(function (t, indice) {
                                Relatorio.create({
                                    rei: `${acoes[i].rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '13',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '11',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })


                            var prejuizo = defesa

                            console.log('ponto 10');
                            while (prejuizo >= 1) {

                                if (acoes[i].tropas != 0) {
                                    acoes[i].tropas--
                                    prejuizo--
                                } else if (acoes[i].arqueiros != 0) {
                                    acoes[i].arqueiros--
                                    prejuizo--
                                    prejuizo--
                                    prejuizo--
                                }

                                for (let q = 0; q < auxatq.length; q++) {
                                    if (prejuizo >= 1 && auxatq[q].tropas >= 1) {
                                        auxatq[q].tropas--
                                        prejuizo--
                                    } else if (prejuizo >= 1 && auxatq[q].arqueiros >= 1) {
                                        auxatq[q].arqueiros--
                                        prejuizo--
                                        prejuizo--
                                        prejuizo--
                                    }
                                }
                            }
                            //Pode melhorar performance, att mesmo com def = 0
                            auxatq.forEach(function (n, i) {
                                Territorio.update({
                                    tropas: `${n.tropas}`,
                                    arqueiros: `${n.arqueiros}`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })

                            Territorio.update({
                                tropas: `${acoes[i].tropas}`,
                                arqueiros: `${acoes[i].arqueiros}`
                            }, {
                                where: { localizacao: `${acoes[i].origem}` }
                            });
                        } else {
                            //Atualizando tropas do atacante, nesse caso, não houve apoios
                            var novastropas = defesa

                            while (novastropas >= 1) {
                                if (acoes[i].tropas != 0) {
                                    acoes[i].tropas--
                                    novastropas--
                                } else if (acoes[i].arqueiros != 0) {
                                    acoes[i].arqueiros--
                                    novastropas--
                                }
                            }

                            Territorio.update({
                                tropas: `${acoes[i].tropas}`,
                                arqueiros: `${acoes[i].arqueiros}`
                            }, {
                                where: { localizacao: `${acoes[i].origem}` }
                            });
                        }
                    } else {
                        //Criando o Relatório para as pessoas que defenderam (lado vencedor)
                        Relatorio.create({
                            rei: `${acoes[i].rei}`,
                            origem: `${acoes[i].origem}`,
                            destino: `${acoes[i].destino}`,
                            mensagem: '3',
                            rodada: `${rodadaatual[0].rodada_atual}`
                        });
                        if (terr) {
                            Relatorio.create({
                                rei: `${terr.rei}`,
                                origem: `${acoes[i].origem}`,
                                destino: `${acoes[i].destino}`,
                                mensagem: '6',
                                rodada: `${rodadaatual[0].rodada_atual}`
                            });
                        }
                        //Criando o Relatório para as pessoas que ajudaram a defenderam e reduzindo suas tropas
                        if (apoiodef) {
                            auxdef.forEach(function (t, indice) {
                                if (terr) {
                                    Relatorio.create({
                                        rei: `${terr.rei}`,
                                        origem: `${t.origem}`,
                                        destino: `${acoes[i].destino}`,
                                        mensagem: '13',
                                        rodada: `${rodadaatual[0].rodada_atual}`
                                    });
                                }
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '11',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })

                            var prejuizo = ataque
                            //erro do natureza
                            if (!terr) {
                                while (prejuizo >= 1) {
                                    for (let q = 0; q < auxdef.length; q++) {

                                        if (auxdef[q].tropas != 0) {
                                            auxdef[q].tropas--
                                            prejuizo--
                                        } else if (auxdef[q].arqueiros != 0) {
                                            auxdef[q].arqueiros--
                                            prejuizo--
                                            prejuizo--
                                            prejuizo--
                                        }
                                    }
                                }
                            } else {
                                while (prejuizo >= 1) {
                                    if (terr.tropas != 0) {
                                        terr.tropas--
                                        prejuizo--
                                    } else if (terr.arqueiros != 0) {
                                        auxdef[q].arqueiros--
                                        prejuizo--
                                        prejuizo--
                                        prejuizo--
                                    }

                                    for (let q = 0; q < auxdef.length; q++) {
                                        if (prejuizo >= 1 && auxdef[q].tropas >= 1) {
                                            auxdef[q].tropas--
                                            prejuizo--
                                        } else if (prejuizo >= 1 && auxdef[q].arqueiros >= 1) {
                                            auxdef[q].arqueiros--
                                            prejuizo--
                                            prejuizo--
                                            prejuizo--
                                        }
                                    }
                                }
                            }

                            auxdef.forEach(function (n, i) {
                                Territorio.update({
                                    tropas: `${n.tropas}`,
                                    arqueiros: `${n.arqueiros}`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })
                            if (terr) {
                                Territorio.update({
                                    tropas: `${terr.tropas}`,
                                    arqueiros: `${terr.arqueiros}`
                                }, {
                                    where: { localizacao: `${acoes[i].destino}` }
                                });
                            }

                        } else {
                            var novastropas = ataque

                            while (novastropas >= 1) {
                                if (terr.tropas != 0) {
                                    terr.tropas--
                                    novastropas--
                                } else if (terr.arqueiros != 0) {
                                    terr.arqueiros--
                                    novastropas--
                                    novastropas--
                                    novastropas--
                                }
                            }
                            Territorio.update({
                                tropas: `${terr.tropas}`,
                                arqueiros: `${terr.arqueiros}`
                            }, {
                                where: { localizacao: `${acoes[i].destino}` }
                            });
                        }

                        if (apoioatk) {
                            auxatq.forEach(function (t, indice) {
                                Relatorio.create({
                                    rei: `${acoes[i].rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '13',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                                Relatorio.create({
                                    rei: `${t.rei}`,
                                    origem: `${t.origem}`,
                                    destino: `${acoes[i].destino}`,
                                    mensagem: '12',
                                    rodada: `${rodadaatual[0].rodada_atual}`
                                });
                            })
                            auxatq.forEach(function (n, i) {
                                Territorio.update({
                                    tropas: `0`,
                                    arqueiros: `0`
                                }, {
                                    where: { localizacao: `${n.origem}` }
                                });
                            })
                        }
                        Territorio.update({
                            tropas: `0`,
                            arqueiros: `0`
                        }, {
                            where: { localizacao: `${acoes[i].origem}` }
                        });
                    }
                }
            }
            //Dando a grana das coletas
            for (let i = 0; i < coletas.length; i++) {
                let reinos = await Reino.findAll({ order: [['rei', 'DESC']], attributes: ['nome_reino', 'rei'] });
                let todosterritorios = await Territorio.findAll({ order: [['rei', 'DESC']], attributes: ['localizacao', 'rei', 'nome_territorio'], where: { rei: `${coletas[i].rei}` }, raw: true });
                let territorio = await Territorio.findOne({ where: { localizacao: `${coletas[i].origem}` }, attributes: ['localizacao', 'tropas', 'rei'], raw: true });

                var ouroganho = func.ourocoletado(reinos.length, todosterritorios.length)

                Reino.increment('ouro', { by: ouroganho, where: { rei: `${territorio.rei}` } });
            }
            Reino.update({
                barcos_ocupados: 0,
            }, {
                where: { nome_reino: { [Op.not]: null } }
            });

            var novarodada = parseInt(rodadaatual[0].rodada_atual) + 1;
            Rodada.update({
                rodada_atual: novarodada,
            }, {
                where: { id_rodada: 1 }
            });

            return message.channel.send(`Rodada encerrada, utilize os comandos !cenario e !relatorio para maiores informações`);

            // IMPLEMENTAÇÃO SEM FAZER - RELATORIOS DE APOIO QUANDO N EXISTEM ATAQUES
        }
    }
}