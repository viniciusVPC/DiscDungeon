const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  async botoesSimNao(textoSim, textoNao) {
    const botaoSim = new ButtonBuilder()
      .setLabel(textoSim)
      .setEmoji("🙆‍♂️")
      .setStyle(ButtonStyle.Success)
      .setCustomId("sim");

    const botaoNao = new ButtonBuilder()
      .setLabel(textoNao)
      .setEmoji("🙅‍♂️")
      .setStyle(ButtonStyle.Danger)
      .setCustomId("nao");

    return new ActionRowBuilder().addComponents(botaoSim, botaoNao);
  },
};
