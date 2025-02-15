const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("recarrega")
        .setDescription("Recarrega um comando.")
        .addStringOption((option) =>
            option
                .setName("comando")
                .setDescription("O comando a ser recarregado.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const commandName = interaction.options
            .getString("comando", true)
            .toLowerCase();

        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply(
                `Não há um comando com nome \`${commandName}\`!`
            );
        }

        delete require.cache[require.resolve(`../utility/${command.data.name}.js`)];

        try {
            const newCommand = require(`../utility/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(
                `O comando \`${newCommand.data.name}\` foi recarregado com sucesso!`
            );
        } catch (error) {
            console.error(error);
            await interaction.reply(
                `Houve um erro recarregando o comando \`${command.data.name}\`:\n\`${error.message}\``
            );
        }
    },
};
