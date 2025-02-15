import { EmbedBuilder, Guild } from "discord.js";
import Preference from "../models/Preferences.js";
import Level from "../models/Level.js";
import calculateLevelXp from "../utils/calculateLevelXp.js";

/**
 *
 * @param {Guild} guild
 */
export async function spawnMonster(guild) {
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
      const player = await Level.findOne({
        userId: message.author.id,
        guildId: message.guildId,
      });
      if (player) {
        console.log(player);
        console.log("Xp antes: " + player.xp);
        player.xp += 500;
        console.log("Xp depois: " + player.xp);
        if (player.xp > calculateLevelXp(player.level)) {
          player.xp = 0;
          player.level += 1;
          mensagem.channel.send(
            `${mensagem.member} parabéns! Você subiu de nível pro **nível ${player.level}**.`
          );
        }
        await player.save().catch((e) => {
          console.log("Erro salvando o novo nível: " + e);
        });
      } else {
        console.log("Pessoa ainda não está no banco de dados.");
      }
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
}
