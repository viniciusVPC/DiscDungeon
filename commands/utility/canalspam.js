const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
} = require("discord.js");
const { execute } = require("./equipe");
const Preferences = require("../../models/Preferences");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("canalspam")
    .setDescription(
      "Configura o canal em que o Bot enviará suas mensagens automáticas. (monstros, dungeons, quests etc."
    )
    .addChannelOption((option) =>
      option
        .setName("canal")
        .setDescription("O canal escolhido.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const canal = interaction.options.getChannel("canal");
    console.log("Canal selecionado: " + canal);
    try {
      const preferencias = await Preferences.findOne({
        guildId: interaction.guildId,
      });
      if (preferencias) {
        preferencias.spamChannelId = canal.id;
        await preferencias.save().then(
          await interaction.reply({
            content: `Canal de spam configurado com sucesso! O novo canal é: ${canal}`,
          })
        );
        await canal.send(
          "Esse é o meu novo canal de spam! Que bacana!! Se quiser configurar outro canal para spam, só usar o comando `/canalspam` novamente!"
        );
      } else {
        const novaPreferencia = new Preferences({
          guildId: interaction.guildId,
          spamChannelId: canal.id,
        });
        await novaPreferencia.save().then(
          await interaction.reply({
            content: `Canal de spam configurado com sucesso! O novo canal é: ${canal}`,
          })
        );
        await canal.send(
          "Esse é o meu novo canal de spam! Que bacana!! Se quiser configurar outro canal para spam, só usar o comando `/canalspam` novamente!"
        );
      }
    } catch (error) {
      console.error("Erro na hora de salvar preferências: " + error);
    }
  },
};
