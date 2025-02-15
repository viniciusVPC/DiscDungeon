//Só execute esse arquivo caso algum nome ou descrição de comando foram alterados
//Se o "execute" da função mudar, não precisa executar esse arquivo.

const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const guildCommands = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    if (folder.match("guildOnly")) {
        const guildCommandsPath = path.join(foldersPath, folder);
        const guildCommandFiles = fs
            .readdirSync(guildCommandsPath)
            .filter((guildFile) => guildFile.endsWith(".js"));
        for (const guildFile of guildCommandFiles) {
            const guildFilePath = path.join(guildCommandsPath, guildFile);
            const guildCommand = require(guildFilePath);
            if ("data" in guildCommand && "execute" in guildCommand) {
                guildCommands.push(guildCommand.data.toJSON());
            } else {
                console.log(
                    `[ATENÇÃO] O comando de guilda em ${filePath} não contém as propriedades "data" ou "execute".`
                );
            }
        }
    } else {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ("data" in command && "execute" in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(
                    `[ATENÇÃO] O comando em ${filePath} não contém as propriedades "data" ou "execute".`
                );
            }
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(
            `Começou recarregando ${commands.length} comandos de aplicação e ${guildCommands.length} comandos específicos de Guilda.`
        );

        const data = await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });

        console.log(`${data.length} aplicações recarregadas com sucesso.`);

        const guildData = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: guildCommands }
        );

        console.log(
            `${guildData.length} aplicações de guildas recarregadas com sucesso.`
        );
    } catch (error) {
        console.error(error);
    }
})();
