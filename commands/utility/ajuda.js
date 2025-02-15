const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("ajuda")
    .setDescription("Exibe todos os comandos."),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    interaction.reply(
      "`/ajuda` - Exibe todos os comandos.\n\
`/canalspam` - Seleciona um canal para o bot enviar mensagens automáticas\n\
`/criamonstro` - Comando Debug. Instancia um monstro. O nome deve ser escrito em inglês\n\
`/equipe` - Comandos relacionados à criação, visualização e edição de equipes\n\
`/nivel` - Visualiza o seu ou (se especificar um user) o nível de um usuário\n\
`/oi` - Oi!\n\
`/ppt` - Escolha um outro usuário para jogar pedra papel tesoura com ele(a)"
    );
  },
};
