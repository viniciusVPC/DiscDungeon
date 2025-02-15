const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");

const { randomRange } = require("../../utils/mathUtil.js");

const escolhas = [{ nome: "atacar" }, { nome: "defender" }, { nome: "fugir" }];

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("criamonstro")
    .setDescription("Cria um monstro.")
    .addStringOption((option) =>
      option
        .setName("nome")
        .setDescription("O nome do monstro criado")
        .setRequired(true)
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
    const nome = interaction.options.getString("nome").toLowerCase();
    const vida = randomRange(50, 100);

    const embed = new EmbedBuilder()
      .setTitle(`Cuidado! Um ${nome} apareceu!!!`)
      .setDescription(
        "Escreva `/atacar` , `/defender` ou `/fugir` para realizar uma ação."
      )
      .setColor("Orange")
      .setImage(`https://www.aidedd.org/dnd/images/${nome}.jpg`)
      .setTimestamp(new Date());

    const channel = interaction.channel;

    await interaction.reply("Criado");
    await interaction.deleteReply();
    const mensagem = await channel.send({ embeds: [embed] });

    const collector = channel.createMessageCollector({
      filter: (message) => message.content === "/atacar",
      time: 30000,
    });

    let respondeu = false;

    collector.on("collect", (message) => {
      message.reply("Você atacou. O monstro morreu.");
      mensagem.delete();
      respondeu = true;
      collector.stop();
    });

    collector.on("end", () => {
      if (!respondeu) interaction.channel.send("Ninguém atacou à tempo.");
    });
  },
};
