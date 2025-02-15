const fs = require("node:fs");
const path = require("node:path");
const data = require("../words/NomesMonstros.json");

module.exports = {
  objMonstroAleatorio: function () {
    const indiceAleatorio = Math.floor(Math.random() * data.length);
    const objetoAleatorio = data[indiceAleatorio];
    return objetoAleatorio;
  },
};
