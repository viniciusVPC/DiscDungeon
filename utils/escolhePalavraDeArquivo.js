const fs = require("node:fs");
const path = require("node:path");
const data = require("../words/NomesMonstros.json");

module.exports = {
    objMonstroAleatorio: async function (vidaLimite) {
        const dataFiltrada = await data.filter(function (monstro) {
            return monstro.vida <= vidaLimite;
        });
        const indiceAleatorio = Math.floor(Math.random() * dataFiltrada.length);
        const objetoAleatorio = dataFiltrada[indiceAleatorio];
        console.log(dataFiltrada);
        console.log(
            "o índice é: " +
            indiceAleatorio +
            " e o objeto aleatório é: " +
            objetoAleatorio.nome
        );
        return objetoAleatorio;
    },
};
