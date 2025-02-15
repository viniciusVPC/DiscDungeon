const { Message } = require("discord.js");
const Level = require("../models/Level");
const calculateLevelXp = require("../utils/calculateLevelXp");

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
        player.xp = 0;
        player.level += 1;
        message.channel.send(
          `${message.author} parabéns! Você subiu de nível pro **nível ${player.level}**.`
        );
      }
      await player.save().catch((e) => {
        console.log("Erro salvando o novo nível: " + e);
      });
    } else {
      console.log("Pessoa ainda não está no banco de dados.");
    }
  },
};
