const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName("oi")
        .setDescription("Cumprimenta o usuário!"),

    async execute(interaction) {
        await interaction.reply(
            `Olá, ${interaction.user.username}! Como você vai?`
        );
        const message = await interaction.fetchReply();
        console.log(message);
    },
};
