const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const choices = [
  { nome: "Pedra", emoji: "🪨", derrota: "Tesoura" },
  { nome: "Papel", emoji: "📃", derrota: "Pedra" },
  { nome: "Tesoura", emoji: "✂️", derrota: "Papel" },
];

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("ppt")
    .setDescription("Jogue pedra papel tesoura com outro usuário")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("O usuário com quem você quer jogar")
        .setRequired(true)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      const adversario = interaction.options.getUser("usuario");

      //Confere se adversário não é o próprio usuário
      if (interaction.user.id === adversario.id) {
        interaction.reply({
          content: "Você não pode jodar pedra papel tesoura com você mesmo(a).",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      //Confere se adversário não é um Bot
      if (adversario.bot) {
        interaction.reply({
          content: "Você não pode jodar pedra papel tesoura com um bot.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("Pedra Papel Tesoura")
        .setDescription(`É o turno do(a): ${adversario}`)
        .setColor("Yellow")
        .setTimestamp(new Date());

      const buttons = choices.map((choice) => {
        return new ButtonBuilder()
          .setCustomId(choice.nome)
          .setLabel(choice.nome)
          .setStyle(ButtonStyle.Primary)
          .setEmoji(choice.emoji);
      });

      const row = new ActionRowBuilder().addComponents(buttons);

      const resposta = await interaction.reply({
        content: `${adversario}, você foi desafiado(a) para um jogo de Pedra Papel Tesoura por ${interaction.user}. Para começar a jogar, clique em um dos botões abaixo!`,
        embeds: [embed],
        components: [row],
      });

      const targetUserInteraction = await resposta
        .awaitMessageComponent({
          filter: (i) => i.user.id === adversario.id,
          time: 20000,
        })
        .catch(async (error) => {
          embed.setDescription(
            `Fim de jogo. ${adversario} não respondeu à tempo.`
          );
          await resposta.edit({ embeds: [embed], components: [] });
        });
      if (!targetUserInteraction) return;

      const targetUserChoice = choices.find(
        (choice) => choice.nome === targetUserInteraction.customId
      );

      await targetUserInteraction.reply({
        content: `Você escolheu ${
          targetUserChoice.nome + targetUserChoice.emoji
        }`,
        flags: MessageFlags.Ephemeral,
      });

      //Atualiza o turno
      embed.setDescription(`Agora é o turno do(a) ${interaction.user}.`);
      await resposta.edit({
        content: `${interaction.user} agora é o seu turno.`,
        embeds: [embed],
      });

      const initialUserInteraction = await resposta
        .awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 20000,
        })
        .catch(async (error) => {
          embed.setDescription(
            `Fim de jogo. ${interaction.user} não respondeu à tempo.`
          );
          await resposta.edit({ embeds: [embed], components: [] });
        });
      if (!initialUserInteraction) return;

      const initialUserChoice = choices.find(
        (choice) => choice.nome === initialUserInteraction.customId
      );

      let result;

      if (targetUserChoice.derrota === initialUserChoice.nome) {
        result = `${adversario} venceu!!!`;
      }
      if (initialUserChoice.derrota === targetUserChoice.nome) {
        result = `${interaction.user} venceu!!!`;
      }
      if (initialUserChoice.nome === targetUserChoice.nome) {
        result = "Houve empate!!!";
      }

      embed.setDescription(
        `${adversario} escolheu ${
          targetUserChoice.nome + targetUserChoice.emoji
        }\n
        ${interaction.user} escolheu ${
          initialUserChoice.nome + initialUserChoice.emoji
        }\n
        \n
        ${result}`
      );

      resposta.edit({ embeds: [embed], components: [] });
    } catch (error) {
      console.error("Ocorreu um erro no ppt " + error);
    }
  },
};
