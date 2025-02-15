const { Guild, ChannelType, Client, Events } = require("discord.js");

module.exports = {
    name: Events.GuildCreate,
    once: true,

    /**
     *
     * @param {Client} client
     * @param {Guild} guild
     */
    execute(guild) {
        const channels = guild.channels;
        let channelId = null;

        channels.cache.forEach((channel) => {
            if (channel.type == ChannelType.GuildText) {
                channelId = channel.id;
                return;
            }
        });

        const channel = guild.channels.cache.get(
            guild.systemChannelId || channelId
        );
        channel.send(
            "Obrigado por me adicionar no seu servidor! Esse bot foi feito com todo o carinho pelo Vinícius Costa!\nDigite `/ajuda` para conhecer os meus comandos!\nAntes de tudo, por favor digite `/canalspam` para configurar em qual canal eu posso enviar mensagens!"
        );
    },
};
