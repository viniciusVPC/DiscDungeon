const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
  ComponentType,
} = require("discord.js");

const {
  criaEquipe,
  adicionaEquipe,
  deletaEquipe,
  confereSeJaTemEquipe,
  procuraEquipeDoUsuario,
  exibeEquipe,
  saiEquipe,
  concluiCriacao,
  renomeiaEquipe,
} = require("../../system/equipeControl.js");
const { botoesSimNao } = require("../../utils/botoesSimNao.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("equipe")
    .setDescription("Comandos relacionados à sua Equipe!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("criar")
        .setDescription("Cria uma equipe com seus amigos!")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("exibir").setDescription("Exibe a sua equipe atual")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("sair")
        .setDescription(
          "Sai da equipe atual. Disponível somente se você não for o líder da equipe."
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("nome")
        .setDescription("Muda o nome da equipe para o nome escrito.")
        .addStringOption((option) =>
          option
            .setName("nome")
            .setDescription("O novo nome da equipe.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("deletar").setDescription("Deleta a sua equipe.")
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();
    console.log("Pessoa usando o comando: " + interaction.user.username);
    const jaTemEquipe = await confereSeJaTemEquipe(interaction);
    try {
      if (interaction.options.getSubcommand() === "criar") {
        if (!jaTemEquipe) {
          subcomandoCriar(interaction);
        } else {
          await interaction.editReply(
            "Você não pode criar uma equipe pois já está em outra equipe! Saia da equipe ou delete a equipe (se for lider dela) antes de criar outra!"
          );
          setTimeout(() => {
            interaction.deleteReply();
          }, 2000);
          return;
        }
      }
      if (interaction.options.getSubcommand() === "exibir") {
        if (jaTemEquipe) {
          subcomandoExibir(interaction);
        } else {
          await interaction.editReply(
            "Você não pode usar esse comando pois ainda não pertence a uma equipe! Crie uma equipe ou entre em uma já existente antes!"
          );
          setTimeout(() => {
            interaction.deleteReply();
          }, 2000);
          return;
        }
      }
      if (interaction.options.getSubcommand() === "sair") {
        if (jaTemEquipe) {
          subcomandoSair(interaction);
        } else {
          await interaction.editReply(
            "Você não pode usar esse comando pois ainda não pertence a uma equipe! Crie uma equipe ou entre em uma já existente antes!"
          );
          setTimeout(() => {
            interaction.deleteReply();
          }, 2000);
          return;
        }
      }
      if (interaction.options.getSubcommand() === "deletar") {
        if (jaTemEquipe) {
          subcomandoDeletar(interaction);
        } else {
          await interaction.editReply(
            "Você não pode usar esse comando pois ainda não pertence a uma equipe! Crie uma equipe ou entre em uma já existente antes!"
          );
          setTimeout(() => {
            interaction.deleteReply();
          }, 2000);
          return;
        }
      }
      if (interaction.options.getSubcommand() === "nome") {
        if (jaTemEquipe) {
          subcomandoRenomear(interaction);
        } else {
          await interaction.editReply(
            "Você não pode usar esse comando pois ainda não pertence a uma equipe! Crie uma equipe ou entre em uma já existente antes!"
          );
        }
      }
    } catch (error) {
      interaction.reply("Houve um erro" + error);
    }
  },
};

/**
 * @param {ChatInputCommandInteraction} interaction
 */
async function subcomandoCriar(interaction) {
  const now = Date.now();
  const expirationTime = now + 50000;
  const expiredTimestamp = Math.round(expirationTime / 1000);

  //Cria um Scheme Equipe no banco de dados.
  await criaEquipe(interaction);
  const quant = (await exibeEquipe(interaction)).length + 1;
  console.log("quant: " + quant);

  //cria o embed
  const embed = new EmbedBuilder()
    .setTitle(`${interaction.user.username} quer criar uma equipe!`)
    .setDescription(
      `Quantidade de pessoas: ${quant}\n
    Inscrições fecham em: <t:${expiredTimestamp}:R>`
    )
    .setColor("Green")
    .setTimestamp(new Date());

  const aceitar = new ButtonBuilder()
    .setLabel("Entrar na Equipe")
    .setEmoji("🙆‍♂️")
    .setStyle(ButtonStyle.Success)
    .setCustomId("aceitar");

  const buttonRow = new ActionRowBuilder().addComponents(aceitar);

  //responde a mensagem com o embed e botões
  const resposta = await interaction.editReply({
    content: `${interaction.user} quer criar uma Equipe!`,
    embeds: [embed],
    components: [buttonRow],
  });

  //coletor aguarda respostas por 50 segundos
  const collector = await resposta.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 50000,
  });

  //caso pegue alguma interação
  collector.on("collect", async (interacaoBotao) => {
    if (interacaoBotao.customId == "aceitar") {
      //
      //se for o líder clicando
      console.log("Quem quer entrar: " + interacaoBotao.user.id);
      if (interacaoBotao.user.id === interaction.user.id) {
        console.log("Dono da equipe quer entrar.");
        const alerta = await interacaoBotao.reply({
          content: "Você não pode entrar na sua própria equipe.",
          flags: MessageFlags.Ephemeral,
        });
        setTimeout(async () => {
          await alerta.delete();
        }, 2000);
      } else {
        console.log("Entrou aqui");
        //
        //se não for o líder clicando
        console.log("Quem quer entrar: " + interacaoBotao.user);
        if (!(await adicionaEquipe(interacaoBotao, interaction.user))) {
          return;
        }

        await interacaoBotao.reply({
          content: `${interacaoBotao.user} entrou na Equipe do(a) ${interaction.user}`,
        });
        const quant = (await exibeEquipe(interaction)).length + 1;
        embed.setDescription(
          `Quantidade de pessoas: ${quant} \n 
          Inscrições fecham em: <t:${expiredTimestamp}:R>`
        );
        await resposta.edit({
          embeds: [embed],
        });
      }
    } else {
      const alerta = await interacaoBotao.reply({
        content: "Funcionalidade ainda não implementada.",
        flags: MessageFlags.Ephemeral,
      });
      setTimeout(async () => {
        await alerta.delete();
      }, 2000);
    }
  });

  //quando o coletor acabar
  collector.on("end", async () => {
    const quant = (await exibeEquipe(interaction)).length + 1;
    embed.setDescription(`Quantidade de pessoas: ${quant}\n
        Inscrições encerradas para essa equipe!`);

    await resposta.edit({ embeds: [embed], components: [] });

    if (quant > 1) {
      interaction.channel.send({
        content: `${interaction.user} criou uma equipe com sucesso! Parabéns!`,
      });
      concluiCriacao(interaction);
    } else {
      interaction.channel.send({
        content: `${interaction.user} não conseguiu criar uma equipe.`,
      });
      deletaEquipe(interaction.user.id, interaction.guildId);
    }
  });
}

/**
 * @param {ChatInputCommandInteraction} interaction
 */
async function subcomandoExibir(interaction) {
  //procura a equipe do usuário.
  try {
    const equipeUsuario = await procuraEquipeDoUsuario(interaction);
    if (equipeUsuario) {
      //Encontrou equipe
      console.log("Encontrei equipe e vou exibi-la" + equipeUsuario);

      const integrantes = [];
      equipeUsuario.componentIds.forEach((componente) => {
        const usuario = interaction.guild.members.cache.get(componente);
        integrantes.push(`\n ${usuario.user.username}`);
      });
      let embed = new EmbedBuilder();

      if (equipeUsuario.leaderId === interaction.user.id) {
        console.log("É o líder quem usou o comando.");
        embed = new EmbedBuilder()
          .setTitle(`${equipeUsuario.name}`)
          .setDescription(
            `Integrantes da equipe: ${integrantes}
          \nPara mudar o nome da equipe, digite \`/equipe nome\`
          Se quiser apagar a equipe, digite \`/equipe deletar\``
          )
          .setColor("Green");
      } else {
        console.log("Não é o líder quem usou o comando.");
        embed = new EmbedBuilder()
          .setTitle(`${equipeUsuario.name}`)
          .setDescription(
            `Integrantes da equipe: ${integrantes}
          \nSe quiser sair da equipe, digite \`/equipe sair\``
          )
          .setColor("Green");
      }

      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply(
        "Você não está em nenhuma equipe no momento!\n\
Use `/equipe criar` para criar uma equipe ou entre na equipe de alguém antes!"
      );
    }
  } catch (error) {
    console.error("Erro exibindo equipe: " + error);
  }
}

/**
 * @param {ChatInputCommandInteraction} interaction
 */
async function subcomandoSair(interaction) {
  const equipe = await procuraEquipeDoUsuario(interaction);
  console.log("Equipe que ele tá tentando sair: " + equipe);
  if (equipe.finished) {
    let respondeu = false;
    if (equipe) {
      if (equipe.leaderId === interaction.user.id) {
        interaction.editReply(
          "Você não pode sair dessa equipe pois é o líder da mesma. Se quiser, use o comando `/equipe deletar` para excluir sua equipe!"
        );
        setTimeout(() => {
          interaction.deleteReply();
        }, 2000);
        return;
      }

      const buttonRow = botoesSimNao(
        "Sim. Sair da equipe",
        "Não. Permanecer na equipe"
      );

      const alerta = await interaction.editReply({
        content: `Você tem certeza que deseja sair da equipe ${equipe.name}?`,
        components: [buttonRow],
        flags: MessageFlags.Ephemeral,
      });

      //coletor aguarda respostas por 5 segundos
      const collector = alerta.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 5000,
      });

      collector.on("collect", async (interacaoBotao) => {
        if (interacaoBotao.user.id === interaction.user.id) {
          respondeu = true;
          if (interacaoBotao.customId === "sim") {
            if (await saiEquipe(interacaoBotao)) {
              await interacaoBotao.channel.send({
                content: `${interacaoBotao.user} saiu da equipe ${equipe.name} com sucesso.`,
              });
            } else {
              await interacaoBotao.channel.send({
                content: `${interacaoBotao.user} não conseguiu sair da equipe pois ocorreu um erro inesperado.\nAguarde uns instantes antes de tentar novamente ou entre em contato com um administrador`,
              });
            }
          } else {
            await interacaoBotao.channel.send({
              content: `${interacaoBotao.user} não saiu da equipe.`,
            });
          }
          alerta.delete();
        } else {
          const outroAlerta = await interacaoBotao.reply({
            content: "Você não pode responder a essa mensagem.",
            flags: MessageFlags.Ephemeral,
          });
          setTimeout(async () => {
            outroAlerta.delete();
          }, 2000);
        }
      });

      collector.on("end", async () => {
        if (!respondeu) {
          await interaction.editReply({
            content: "Tempo de resposta acabou.",
            components: [],
          });
          setTimeout(() => {
            interaction.deleteReply();
          }, 5000);
        }
      });
    }
  } else {
    console.log("Equipe não acabou de ser feita.");
    await interaction.editReply({
      content: "Aguarde as inscrições da equipe acabarem antes de sair dela!",
    });
    setTimeout(() => {
      interaction.deleteReply();
    }, 2000);
  }
}

async function subcomandoDeletar(interaction) {
  const equipe = await procuraEquipeDoUsuario(interaction);
  if (equipe.finished) {
    let respondeu = false;
    if (equipe.leaderId != interaction.user.id) {
      interaction.editReply(
        "Você não pode deletar essa equipe pois não é o líder da mesma. Se quiser, use o comando `/equipe sair` para sair dessa equipe!"
      );

      setTimeout(() => {
        interaction.deleteReply();
      }, 2000);
      return;
    }

    const buttonRow = botoesSimNao("Sim. Deletar equipe", "Não. Manter equipe");

    const alerta = await interaction.editReply({
      content: `Você tem certeza que deseja deletar a equipe ${equipe.name}?`,
      components: [buttonRow],
      flags: MessageFlags.Ephemeral,
    });

    //coletor aguarda respostas por 5 segundos
    const collector = alerta.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5000,
    });

    collector.on("collect", async (interacaoBotao) => {
      if (interacaoBotao.user.id === interaction.user.id) {
        respondeu = true;
        if (interacaoBotao.customId === "sim") {
          deletaEquipe(interaction.user.id, interaction.guildId);
          await interacaoBotao.channel.send({
            content: `${interacaoBotao.user} deletou a equipe ${equipe.name} com sucesso.`,
          });
        } else {
          await interacaoBotao.channel.send({
            content: `${interacaoBotao.user} decidiu poupar a vida da equipe.`,
          });
        }
        alerta.delete();
      } else {
        const outroAlerta = await interacaoBotao.reply({
          content: "Você não pode responder a essa mensagem.",
          flags: MessageFlags.Ephemeral,
        });
        setTimeout(async () => {
          outroAlerta.delete();
        }, 2000);
      }
    });

    collector.on("end", async () => {
      if (!respondeu) {
        await interaction.editReply({
          content: "Tempo de resposta acabou.",
          components: [],
        });
        setTimeout(() => {
          interaction.deleteReply();
        }, 5000);
      }
    });
  } else {
    console.log("Equipe não acabou de ser feita.");
    await interaction.editReply({
      content: "Aguarde as inscrições da equipe acabarem antes de deletá-la!",
    });
    setTimeout(() => {
      interaction.deleteReply();
    }, 2000);
  }
}

/**
 * @param {ChatInputCommandInteraction} interaction
 */
async function subcomandoRenomear(interaction) {
  const equipe = await procuraEquipeDoUsuario(interaction);
  if (equipe.leaderId != interaction.user.id) {
    interaction.editReply(
      "Você não pode renomear essa equipe pois não é o líder da mesma."
    );
    setTimeout(() => {
      interaction.deleteReply();
    }, 2000);
    return;
  }
  const nome = interaction.options.getString("nome");
  if (renomeiaEquipe(interaction, nome))
    interaction.editReply("Equipe renomeada com sucesso para " + nome);
  else {
    interaction.editReply(
      "Ocorreu um erro inesperado e a equipe não pode ser renomeada. Por favor tente novamente em breve."
    );
  }
}
