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
      var ArrEven = [parseInt(`${xorigem - 2}${yorigem - 1}`), parseInt(`${xorigem - 2}${yorigem}`), parseInt(`${xorigem-2}${yorigem + 1}`), parseInt(`${xorigem-1}${yorigem - 2}`), parseInt(`${xorigem - 1}${yorigem - 1}`), parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem - 1}${yorigem+1}`), parseInt(`${xorigem}${yorigem-2}`), parseInt(`${xorigem}${yorigem-1}`), parseInt(`${xorigem}${yorigem+1}`), parseInt(`${xorigem}${yorigem+2}`), parseInt(`${xorigem + 1}${yorigem-2}`), parseInt(`${xorigem + 1}${yorigem-1}`), parseInt(`${xorigem + 1}${yorigem}`), parseInt(`${xorigem + 1}${yorigem+1}`), parseInt(`${xorigem + 2}${yorigem-1}`), parseInt(`${xorigem + 2}${yorigem}`), parseInt(`${xorigem +2}${yorigem+1}`)]
  
      if (ArrEven.includes(teste)) {
        return true
      }
    } else {
      var ArrOdd = [parseInt(`${xorigem - 2}${yorigem - 1}`), parseInt(`${xorigem - 2}${yorigem}`), parseInt(`${xorigem-2}${yorigem + 1}`), parseInt(`${xorigem-1}${yorigem - 1}`), parseInt(`${xorigem - 1}${yorigem}`), parseInt(`${xorigem - 1}${yorigem+1}`), parseInt(`${xorigem - 1}${yorigem+2}`), parseInt(`${xorigem}${yorigem-2}`), parseInt(`${xorigem}${yorigem-1}`), parseInt(`${xorigem}${yorigem+1}`), parseInt(`${xorigem}${yorigem+2}`), parseInt(`${xorigem + 1}${yorigem-1}`), parseInt(`${xorigem + 1}${yorigem}`), parseInt(`${xorigem + 1}${yorigem+1}`), parseInt(`${xorigem + 1}${yorigem+2}`), parseInt(`${xorigem + 2}${yorigem-1}`), parseInt(`${xorigem + 2}${yorigem}`), parseInt(`${xorigem +2}${yorigem+1}`)]
  
      if (ArrOdd.includes(teste)) {
        return true
      }
    }
    return false
  }

module.exports.ourocoletado = ourocoletado;
module.exports.adjacente = adjacente;
module.exports.adjacente = adjacente2dist;