const {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  AttachmentBuilder,
} = require("discord.js");

const Level = require("../../models/Level");
const { RankCardBuilder, Font } = require("canvacord");
const calculateLevelXp = require("../../utils/calculateLevelXp");

Font.loadDefault();

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("nivel")
    .setDescription("Visualiza o seu nível ou o de outro jogador.")
    .addUserOption((option) =>
      option
        .setName("jogador")
        .setDescription("O jogador cujo nível você quer ver.")
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    if (!interaction.inGuild()) {
      interaction.reply(
        "Você só pode usar esse comando dentro de um servidor."
      );
      return;
    }
    await interaction.deferReply();

    const usuarioMencionado = interaction.options.getUser("jogador");
    const usuario = usuarioMencionado || interaction.user;
    const membro = await interaction.guild.members.fetch(usuario.id);

    const nivelRecuperado = await Level.findOne({
      userId: usuario.id,
      guildId: interaction.guild.id,
    });

    if (!nivelRecuperado) {
      interaction.editReply(
        usuarioMencionado
          ? `${usuario.tag} ainda não tem nenhum nível. Tente novamente depois que ele(a) conversar um pouco mais!`
          : "Você ainda não tem nenhum nível. Tente novamente depois que você conversar um pouco mais!"
      );
      return;
    }

    let todosNiveis = await Level.find({
      guildId: interaction.guild.id,
    }).select("-_id userId level xp");

    todosNiveis.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let rankAtual =
      todosNiveis.findIndex((lvl) => lvl.userId === usuario.id) + 1;

    const card = new RankCardBuilder()
      .setAvatar(usuario.displayAvatarURL({ format: "png", size: 512 }))
      .setRank(rankAtual)
      .setLevel(nivelRecuperado.level)
      .setCurrentXP(nivelRecuperado.xp)
      .setRequiredXP(calculateLevelXp(nivelRecuperado.level))
      .setUsername(usuario.username)
      .setDisplayName(usuario.displayName);

    const data = await card.build({
      format: "png",
    });
    const anexo = new AttachmentBuilder(data);
    interaction.editReply({ files: [anexo] });
  },
};
