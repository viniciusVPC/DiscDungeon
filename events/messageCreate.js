const { Client, Message, Events } = require("discord.js");
const { randomRange } = require("../utils/mathUtil");
const Level = require("../models/Level");
const calculateLevelXp = require("../utils/calculateLevelXp");
const { spawnMonster } = require("../system/monsterControl");
const cooldowns = new Set();
const cooldownMonstro = new Set();

module.exports = {
  name: Events.MessageCreate,
  /**
   *
   * @param {Client} client
   * @param {Message} message
   */
  async execute(message) {
    if (!message.inGuild() || message.author.bot) return;

    let chance = Math.random() * 100;
    if (chance <= 10) {
      console.log("cooldown monstro: " + cooldownMonstro);
      if (!cooldownMonstro.has(message.guildId)) {
        spawnMonster(message.guild);
        cooldownMonstro.add(message.guildId);

        setTimeout(() => {
          cooldownMonstro.delete(message.guildId);
          console.log("cooldown monstro: " + cooldownMonstro);
        }, 120000);
      }
    }

    if (cooldowns.has(message.author.id)) return;

    const xpGanho = randomRange(5, 15);

    const query = {
      userId: message.author.id,
      guildId: message.guild.id,
    };

    try {
      const level = await Level.findOne(query);

      if (level) {
        level.xp += xpGanho;

        if (level.xp > calculateLevelXp(level.level)) {
          level.xp = 0;
          level.level += 1;

          message.channel.send(
            `${message.member} parabéns! Você subiu de nível pro **nível ${level.level}**.`
          );
        }

        await level.save().catch((e) => {
          console.log("Erro salvando o novo nível: " + e);
          return;
        });
        cooldowns.add(message.author.id);
        setTimeout(() => {
          cooldowns.delete(message.author.id);
        }, 60000);
      }

      //Se não tiver nível ainda.
      else {
        console.log("Ainda não tem nível");
        // Cria novo nível.
        const newLevel = new Level({
          userId: message.author.id,
          guildId: message.guild.id,
          xp: 1,
        });

        await newLevel
          .save()
          .catch((e) => console.error("Erro ao salvar usuário: " + e))
          .then(console.log("usuário salvo com sucesso."));
        cooldowns.add(message.author.id);
        setTimeout(() => {
          cooldowns.delete(message.author.id);
        }, 60000);
      }
    } catch (error) {
      console.log("Erro na hora de dar XP: " + error);
    }
  },
};
