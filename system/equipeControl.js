const {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Guild,
    MessageFlags,
    User,
} = require("discord.js");
const Team = require("../models/Team.js");
const Level = require("../models/Level.js");

let equipeTemp = [];

module.exports = {
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    criaEquipe: async function (interaction) {
        equipeTemp = [];
        equipeTemp.push(interaction.user);
        console.log("Começo a criar uma equipe no mongo");
        const newTeam = new Team({
            leaderId: interaction.user.id,
            guildId: interaction.guild.id,
            name: `Equipe do(a) ${interaction.user.username}`,
            componentIds: [],
        });
        try {
            await newTeam.save().then(console.log("Salvei equipe no mongo"));
        } catch (error) {
            console.error("Erro salvando equipe no servidor.");
        }

        try {
            const level = await Level.findOne({
                userId: interaction.user.id,
                guildId: interaction.guildId,
            });
            if (level) {
                console.log("encontrei o usuário que está criando equipe.");
                level.isInTeam = true;
                level.teamLeaderId = interaction.user.id;
            }
            level.save().then(console.log("Usuário salvo com equipe com sucesso."));
        } catch (error) {
            console.error("Erro procurando ou salvando equipe criada no usuário.");
        }
    },

    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     */
    concluiCriacao: async function (interaction) {
        equipeTemp = [];
        const team = await module.exports.procuraEquipePorLider(
            interaction.user.id,
            interaction.guildId
        );
        if (team) {
            team.finished = true;
            await team
                .save()
                .catch((e) => console.error("Erro salvando time concluído: " + e))
                .finally("Time concluído salvo com sucesso.");
        }
    },

    deletaEquipe: async function (idLider, guildId) {
        console.log("Deletando a equipe. Id do lider é: " + idLider);
        const user = await Level.findOne({ userId: idLider, guildId: guildId });
        if (user) {
            console.log("Lider encontrado. Ele é: " + user);
            user.isInTeam = false;
            user.teamLeaderId = "";
            user
                .save()
                .catch((e) => console.error("Erro salvando líder: " + e))
                .finally(console.log("Lider salvo com sucesso."));
        }
        const query = {
            leaderId: idLider,
            guildId: guildId,
        };
        await Team.findOneAndDelete(query).then(
            console.log("Deletada com sucesso")
        );
    },

    /**
     *
     * @param {ButtonInteraction} interaction
     */
    saiEquipe: async function (interaction) {
        const user = await Level.findOne({
            userId: interaction.user.id,
            guildId: interaction.guildId,
        });
        if (user) {
            console.log("Achei o user no mongo: " + user);
            console.log(
                "id lider: " + user.teamLeaderId + " id guilda: " + interaction.guildId
            );
            const team = await module.exports.procuraEquipePorLider(
                user.teamLeaderId,
                interaction.guildId
            );
            if (team) {
                console.log("Achei a equipe no mongo");
                const integrantes = team.componentIds;
                console.log("integrantes pré remoção: " + integrantes);
                integrantes.splice(integrantes.indexOf(user.id), 1);
                console.log("integrantes pós remoção: " + integrantes);
                team.componentIds = integrantes;
                //integrante removido

                team
                    .save()
                    .then(console.log("Equipe salva com sucesso"))
                    .catch((e) => console.error("Erro ao salvar equipe: " + e));

                if (integrantes.length <= 0) {
                    console.log("Equipe só tem um integrante. Deletando equipe");

                    interaction.channel.send(
                        `Como o(a) ultimo(a) integrante da equipe ${team.name} saiu, ela será deletada.`
                    );
                    deletaEquipe(team.leaderId, interaction.guildId);
                }

                user.isInTeam = false;
                user.teamLeaderId = "";
                user
                    .save()
                    .then(console.log("Usuário salvo com sucesso."))
                    .catch((e) => console.error("Erro ao salvar usuário" + e));

                return true;
            }
        }
    },

    /**
     *
     * @param {ButtonInteraction} interaction
     */
    adicionaEquipe: async function (interaction, lider) {
        //procura se pessoa está no banco
        const user = await Level.findOne({
            userId: interaction.user.id,
            guildId: interaction.guildId,
        });

        if (user) {
            if (user.isInTeam) {
                if (user.teamLeaderId === lider.id) {
                    //lider da equipe da pessoa é o dessa equipe
                    console.log("Pessoa já está na equipe.");
                    const alerta = await interaction.reply({
                        content: "Você já entrou nessa equipe!",
                        flags: MessageFlags.Ephemeral,
                    });
                    setTimeout(async () => {
                        await alerta.delete();
                    }, 2000);
                    return; //sai da função
                }
                //Pessoa já está em outra equipe.
                if (user.teamLeaderId === user.userId) {
                    console.log("Pessoa já está em outra equipe e é lider dela");
                    const alerta = await interaction.reply({
                        content:
                            "Você não pode entrar nessa equipe pois já é lider de outra equipe! Tente novamente depois de deletar a equipe existente com `/equipe deletar`!",
                        flags: MessageFlags.Ephemeral,
                    });
                    setTimeout(async () => {
                        await alerta.delete();
                    }, 2000);
                    return; //sai da função
                }
                console.log("Pessoa já está em outra equipe");
                const alerta = await interaction.reply({
                    content:
                        "Você não pode entrar nessa equipe pois já está em outra equipe! Tente novamente depois de sair da sua equipe com `/equipe sair`!",
                    flags: MessageFlags.Ephemeral,
                });
                setTimeout(async () => {
                    await alerta.delete();
                }, 2000);
                return; //sai da função
            }

            //não está em nenhuma equipe
            user.isInTeam = true;
            user.teamLeaderId = lider.id;
            await user
                .save()
                .then(console.log("Usuário salvo com equipe com sucesso."))
                .catch((e) => {
                    console.log("Erro salvando equipe dentro de usuário: " + e);
                    return;
                });

            const team = await module.exports.procuraEquipePorLider(
                lider.id,
                interaction.guildId
            );
            if (team) {
                const integrantes = team.componentIds;
                integrantes.push(interaction.user.id);
                team.componentIds = integrantes;
                await team.save().catch((e) => {
                    console.error("Erro salvando os integrantes da equipe: " + e);
                    return;
                });
                equipeTemp.push(interaction.user);
                return true;
            }
        } else {
            //ainda não está no banco
            const alerta = await interaction.reply({
                content:
                    "Você ainda não pode entrar nessa equipe pois ainda não tem um nível.\nInteraja um pouco mais e tente novamente depois! ",
                flags: MessageFlags.Ephemeral,
            });
            setTimeout(async () => {
                await alerta.delete();
            }, 2000);
            return; // sai da função
        }
    },

    exibeEquipe: async function (interaction) {
        const team = await module.exports.procuraEquipePorLider(
            interaction.user.id,
            interaction.guildId
        );
        if (team) {
            return team.componentIds;
        }
    },

    renomeiaEquipe: async function (interaction, nome) {
        const team = await module.exports.procuraEquipePorLider(
            interaction.user.id,
            interaction.guildId
        );
        if (team) {
            team.name = nome;
            await team
                .save()
                .catch((e) => console.error("Erro salvando equipe: " + e))
                .finally("Equipe salva com sucesso!");
            return true;
        }
    },

    confereSeJaTemEquipe: async function (interaction) {
        console.log("Conferindo se pessoa já tem equipe.");
        let encontrei = false;
        try {
            const level = await Level.findOne({
                userId: interaction.user.id,
                guildId: interaction.guildId,
            });
            if (level) {
                console.log("Encontrei pessoa no mongo");
                if (level.isInTeam) {
                    console.log("Pessoa tem equipe.");
                    encontrei = true;
                } else {
                    console.log("Pessoa não tem equipe.");
                }
            } else {
                console.log("Pessoa ainda não tem cadastro");
                interaction.editReply(
                    "Você não pode criar uma equipe pois ainda não tem um nível! Tente novamente depois de enviar algumas mensagens!"
                );
                encontrei = true;
            }
        } catch (error) { }
        return encontrei;
    },

    procuraEquipeDoUsuario: async function (interaction) {
        //try {
        const level = await Level.findOne({
            userId: interaction.user.id,
            guildId: interaction.guildId,
        });
        if (level) {
            console.log("Encontrei usuário.");
            console.log("Id do líder da equipe do usuário" + level.teamLeaderId);
            const teamFound = await module.exports.procuraEquipePorLider(
                level.teamLeaderId,
                interaction.guildId
            );
            if (teamFound) {
                console.log("Encontrei a equipe e vou retorná-la");
                return teamFound;
            }
        } else return;
        //} catch (error) {
        //  console.error("Erro procurando equipe do usuário: " + error);
        //}
    },

    procuraEquipePorLider: async function (leaderId, guildId) {
        try {
            console.log("Procurando a equipe do lider encontrado.");
            const team = await Team.findOne({ leaderId, guildId });
            if (team) return team;
            else return;
        } catch (error) {
            console.error("Erro procurando equipe através do líder: " + error);
        }
    },
};
