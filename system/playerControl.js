const { Message } = require("discord.js");
const Level = require("../models/Level");
const calculateLevelXp = require("../utils/calculateLevelXp");
const Preferences = require("../models/Preferences");

module.exports = {
  /**
   *
   * @param {Message} message
   */
  adicionaExperiencia: async function (message, quantidade) {
    const player = await Level.findOne({
      userId: message.author.id,
      guildId: message.guildId,
    });
    if (player) {
      console.log(player);
      console.log("Xp antes: " + player.xp);
      player.xp += quantidade;
      console.log("Xp depois: " + player.xp);
      if (player.xp > calculateLevelXp(player.level)) {
        module.exports.sobeDeNivel(message);
      }
      await player.save().catch((e) => {
        console.log("Erro salvando o novo nível: " + e);
      });
    } else {
      console.log("Pessoa ainda não está no banco de dados.");
    }
  },

  sobeDeNivel: async function (message) {
    preference.vidaLimite = player.xp = 0;
    player.level += 1;

    const allPlayers = await Level.find({ guildId: message.guildId });
    if (allPlayers) {
      let media = 0;
      for (let i = 0; i < allPlayers.length; i++) {
        console.log(allPlayers[i]);
        media += allPlayers[i].level;
        console.log("soma: " + media);
      }
      media = media / allPlayers.length;
      console.log("média: " + media);
    }
    const vidaLimite = media * 4;
    console.log("vida limite: " + vidaLimite);
    const preference = await Preferences.findOne({
      guildId: message.guildId,
    });
    if (preference) {
      preference.vidaLimite = vidaLimite;
    }
    preference
      .save()
      .catch("Erro salvando preferências ao subir de nível")
      .finally("Preferências salvas com sucesso ao subir de nível");

    message.channel.send(
      `${message.author} parabéns! Você subiu de nível pro **nível ${player.level}**.`
    );
  },
};
