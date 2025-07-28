const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  async execute(interaction, config) {
    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setDescription(`Latency: ${Date.now() - interaction.createdTimestamp}ms`)
      .setColor(config.embedHex)
      .setFooter({ text: config.footerText });

    await interaction.reply({ embeds: [embed] });
  }
};
