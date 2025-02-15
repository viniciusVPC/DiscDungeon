const { EmbedBuilder, Guild } = require("discord.js");
const Preference = require("../models/Preferences.js");
const Level = require("../models/Level.js");
const calculateLevelXp = require("../utils/calculateLevelXp.js");
const { adicionaExperiencia } = require("./playerControl.js");
const { randomRange } = require("../utils/mathUtil.js");
const { objMonstroAleatorio } = require("../utils/escolhePalavraDeArquivo.js");

/**
 *
 * @param {Guild} guild
 */
module.exports = {
  spawnMonster: async function (guild) {
    const preferences = await Preference.findOne({ guildId: guild.id });
    if (preferences) {
      const objMonstro = objMonstroAleatorio();
      const nome = objMonstro.nome;

      const vida = objMonstro.vida;
      const channel = await guild.channels.fetch(preferences.spamChannelId);

      const embed = new EmbedBuilder()
        .setTitle(
          `Cuidado! ${
            objMonstro.genero ? "uma" : "um "
          } ${nome} com ${vida} pontos de vida apareceu!!!`
        )
        .setDescription(
          "Escreva `/atacar` , `/defender` ou `/fugir` para realizar uma ação."
        )
        .setColor("Orange")
        .setImage(
          `https://www.aidedd.org/dnd/images/${objMonstro.nomeImagem}.jpg`
        )
        .setTimestamp(new Date());

      const mensagem = await channel.send({ embeds: [embed] });

      const collector = channel.createMessageCollector({
        filter: (message) => message.content === "/atacar",
        time: 30000,
      });

      let respondeu = false;

      collector.on("collect", async (message) => {
        message.reply(
          `Você atacou. O monstro morreu e você ganhou ${vida} pontos de Xp.`
        );
        adicionaExperiencia(message, vida);
        respondeu = true;
        collector.stop();
      });

      collector.on("end", async () => {
        if (!respondeu) {
          const fim = await channel.send("Ninguém atacou à tempo.");
          setTimeout(() => {
            fim.delete();
          }, 2000);
          mensagem.delete();
        }
      });
    }
  },
};
