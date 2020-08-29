function adjacente(xorigem, yorigem, xdestino, ydestino) {
    var teste = parseInt(`${xdestino}${ydestino}`)
    if (xorigem % 2 == 0) {
        var ArrEven = [parseInt(`${xorigem - 1}${yorigem - 1}`), parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem}${yorigem - 1}`), parseInt(`${xorigem}${yorigem + 1}`), parseInt(`${xorigem + 1}${yorigem - 1}`), parseInt(`${xorigem + 1}${yorigem}`)]

        if (ArrEven.includes(teste)) {
            return true
        }
    } else {
        var ArrOdd = [parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem - 1}${yorigem + 1}`), parseInt(`${xorigem}${yorigem - 1}`), parseInt(`${xorigem}${yorigem + 1}`), parseInt(`${xorigem + 1}${yorigem}`), parseInt(`${xorigem + 1}${yorigem + 1}`)]

        if (ArrOdd.includes(teste)) {
            return true
        }
    }
    return false
}

function ourocoletado(players, territorios) {
    var ouro

    if (players == 4) {
        switch (true) {
            case (territorios <= 3):
                ouro = 7
                break;
            case (territorios <= 6):
                ouro = 5
                break;
            case (territorios >= 7):
                ouro = 3
                break;
            default:
                break
        }
    }

    if (players == 5) {
        switch (true) {
            case (territorios <= 3):
                ouro = 7
                break;
            case (territorios <= 5):
                ouro = 5
                break;
            case (territorios >= 6):
                ouro = 3
                break;
            default:
                break
        }
    }
    return ouro
}

function adjacente2dist(xorigem, yorigem, xdestino, ydestino) {
    var teste = parseInt(`${xdestino}${ydestino}`)
    if (xorigem % 2 == 0) {
        var ArrEven = [parseInt(`${xorigem - 2}${yorigem - 1}`), parseInt(`${xorigem - 2}${yorigem}`), parseInt(`${xorigem - 2}${yorigem + 1}`), parseInt(`${xorigem - 1}${yorigem - 2}`), parseInt(`${xorigem - 1}${yorigem - 1}`), parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem - 1}${yorigem + 1}`), parseInt(`${xorigem}${yorigem - 2}`), parseInt(`${xorigem}${yorigem - 1}`), parseInt(`${xorigem}${yorigem + 1}`), parseInt(`${xorigem}${yorigem + 2}`), parseInt(`${xorigem + 1}${yorigem - 2}`), parseInt(`${xorigem + 1}${yorigem - 1}`), parseInt(`${xorigem + 1}${yorigem}`), parseInt(`${xorigem + 1}${yorigem + 1}`), parseInt(`${xorigem + 2}${yorigem - 1}`), parseInt(`${xorigem + 2}${yorigem}`), parseInt(`${xorigem + 2}${yorigem + 1}`)]

        if (ArrEven.includes(teste)) {
            return true
        }
    } else {
        var ArrOdd = [parseInt(`${xorigem - 2}${yorigem - 1}`), parseInt(`${xorigem - 2}${yorigem}`), parseInt(`${xorigem - 2}${yorigem + 1}`), parseInt(`${xorigem - 1}${yorigem - 1}`), parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem - 1}${yorigem + 1}`), parseInt(`${xorigem - 1}${yorigem + 2}`), parseInt(`${xorigem}${yorigem - 2}`), parseInt(`${xorigem}${yorigem - 1}`), parseInt(`${xorigem}${yorigem + 1}`), parseInt(`${xorigem}${yorigem + 2}`), parseInt(`${xorigem + 1}${yorigem - 1}`), parseInt(`${xorigem + 1}${yorigem}`), parseInt(`${xorigem + 1}${yorigem + 1}`), parseInt(`${xorigem + 1}${yorigem + 2}`), parseInt(`${xorigem + 2}${yorigem - 1}`), parseInt(`${xorigem + 2}${yorigem}`), parseInt(`${xorigem + 2}${yorigem + 1}`)]

        if (ArrOdd.includes(teste)) {
            return true
        }
    }
    return false
}

function territoriosIniciais(arrayPossibilidades, nJogadores) {
    var territorios = []

    var TerrA = arrayPossibilidades[Math.floor(Math.random() * arrayPossibilidades.length)];
    territorios.push(TerrA)
    const index = arrayPossibilidades.indexOf(TerrA)
    if (index > -1) {
        arrayPossibilidades.splice(index, 1)
    }
    var safe = 0
    while ((territorios.length < nJogadores) && (safe < 1000)) {
        var TerrB = arrayPossibilidades[Math.floor(Math.random() * arrayPossibilidades.length)];
        var controle = 0
        safe++
        for (let i = 0; i < territorios.length; i++) {

            if (!(adjacente2dist(parseInt(territorios[i].split('')[0]), parseInt(territorios[i].split('')[1]), parseInt(TerrB.split('')[0]), parseInt(TerrB.split('')[1])))) {
                controle++
            }
            if (controle == territorios.length) {
                territorios.push(TerrB)
                const index = arrayPossibilidades.indexOf(TerrB)
                if (index > -1) {
                    arrayPossibilidades.splice(index, 1)
                }
                break
            }
        }
    }
    return territorios
}

function numerosParaLetras(x, y) {
    switch (x) {
        case 1:
            x = 'a'
            break;
        case 2:
            x = 'b'
            break;
        case 3:
            x = 'c'
            break;
        case 4:
            x = 'd'
            break;
        case 5:
            x = 'e'
            break;
        case 6:
            x = 'f'
            break;
        case 7:
            x = 'g'
            break;
        default:
            break;
    }

    return x + y
}

function randomMinMax(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function mar_encontra_caminho(mar_origem, mar_destino, mares_controlados, relacao_adjacencia_mares) {
    var caminhos = [[mar_origem]]
    cont = 0

    for (mar of relacao_adjacencia_mares[mar_origem]) {
        if (mares_controlados.includes(mar)) {
            var lista_vazia = []
            caminhos.push(lista_vazia)
            caminhos[cont].push(mar)
            cont++
        }
    }
    for (let i = 0; i < caminhos.length; i++) {
        for (const mar_caminho of caminhos[i]) {
            for (const mar_adjacente of relacao_adjacencia_mares[mar_caminho]) {
                console.log('mar adjacente :', mar_adjacente);
                if (!caminhos[i].includes(mar_adjacente) && mares_controlados.includes(mar_adjacente) && !caminhos[i].includes(mar_destino)) {
                    caminhos[i].push(mar_adjacente)
                    console.log(caminhos)
                }
            }
        }
    }
    encontrou_caminho = false
    for (const caminho of caminhos) {
        if (caminho.includes(mar_destino)) {
            encontrou_caminho = true
        }
    }
    return encontrou_caminho
}

module.exports.ourocoletado = ourocoletado;
module.exports.adjacente = adjacente;
module.exports.adjacente = adjacente2dist;
module.exports.territoriosIniciais = territoriosIniciais;
module.exports.numerosParaLetras = numerosParaLetras;
module.exports.randomMinMax = randomMinMax;
module.exports.mar_encontra_caminho = mar_encontra_caminho;