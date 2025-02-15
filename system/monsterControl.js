const { EmbedBuilder, Guild } = require("discord.js");
const Preference = require("../models/Preferences.js");
const Level = require("../models/Level.js");
const calculateLevelXp = require("../utils/calculateLevelXp.js");
const { adicionaExperiencia } = require("./playerControl.js");

/**
 *
 * @param {Guild} guild
 */
module.exports = {
  spawnMonster: async function (guild) {
    const preferences = await Preference.findOne({ guildId: guild.id });
    if (preferences) {
      const nome = "zombie";
      const channel = await guild.channels.fetch(preferences.spamChannelId);

      const embed = new EmbedBuilder()
        .setTitle(`Cuidado! Um ${nome} apareceu!!!`)
        .setDescription(
          "Escreva `/atacar` , `/defender` ou `/fugir` para realizar uma ação."
        )
        .setColor("Orange")
        .setImage(`https://www.aidedd.org/dnd/images/${nome}.jpg`)
        .setTimestamp(new Date());

      const mensagem = await channel.send({ embeds: [embed] });

      const collector = channel.createMessageCollector({
        filter: (message) => message.content === "/atacar",
        time: 30000,
      });

      let respondeu = false;

      collector.on("collect", async (message) => {
        message.reply("Você atacou. O monstro morreu.");
        adicionaExperiencia(message, 500);
        mensagem.delete();
        respondeu = true;
        collector.stop();
      });

      collector.on("end", () => {
        if (!respondeu) {
          channel.send("Ninguém atacou à tempo.");
          mensagem.delete();
        }
      });
    }
  },
};
