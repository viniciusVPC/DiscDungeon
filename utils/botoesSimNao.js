import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function botoesSimNao(textoSim, textoNao) {
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
}
