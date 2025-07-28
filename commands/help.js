const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show a paginated list of all bot commands'),

  async execute(interaction, config) {
    const commandsPath = path.join(__dirname);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter(file => file.endsWith('.js') && file !== 'help.js');

    const allCommands = commandFiles.map(file => {
      const command = require(`./${file}`);
      return {
        name: `/${command.data.name}`,
        description: command.data.description || 'No description',
      };
    });

    const pageSize = 5;
    let page = 0;
    const totalPages = Math.ceil(allCommands.length / pageSize);

    const getEmbed = () => {
      const current = allCommands.slice(page * pageSize, (page + 1) * pageSize);
      return new EmbedBuilder()
        .setTitle('📖 Command Help')
        .setDescription(current.map(cmd => `**${cmd.name}** – ${cmd.description}`).join('\n\n'))
        .setFooter({ text: `Page ${page + 1} of ${totalPages} • ${config.footerText}` })
        .setColor(config.embedHex);
    };

    const getButtons = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev_help')
          .setLabel('⏮️ Prev')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('next_help')
          .setLabel('⏭️ Next')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages - 1)
      );

    await interaction.reply({ embeds: [getEmbed()], components: [getButtons()] });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({
      time: 60_000,
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: 'You can’t use this button.', ephemeral: true });

      if (i.customId === 'next_help') page++;
      if (i.customId === 'prev_help') page--;

      await i.update({ embeds: [getEmbed()], components: [getButtons()] });
    });

    collector.on('end', () => {
      const disabledRow = getButtons();
      disabledRow.components.forEach(btn => btn.setDisabled(true));
      message.edit({ components: [disabledRow] }).catch(() => {});
    });
  },
};
