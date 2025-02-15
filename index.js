const { Client, GatewayIntentBits } = require("discord.js");
const setup = require("./setup");
const { token, mongodbURI } = require("./config.json");

const mongoose = require("mongoose");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
    ],
});

(async () => {
    await mongoose.connect(mongodbURI);
    try {
        console.log("Conectado com sucesso ao mongodb");
        setup(client);
        client.login(token);
    } catch (error) {
        console.error("Erro no setup. Erro: " + error);
    }
})();
