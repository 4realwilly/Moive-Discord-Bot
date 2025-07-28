const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('upcoming')
    .setDescription('Shows upcoming movies releasing soon'),

  async execute(interaction, config) {
    await interaction.deferReply();

    const res = await fetch(`${config.tmdbApiUrl}/movie/upcoming`, {
      headers: {
        Authorization: `Bearer ${config.tmdbApiToken}`
      }
    });

    const data = await res.json();
    const results = data.results.slice(0, 5);

    if (!results.length) return interaction.editReply({ content: '❌ No upcoming movies found.' });

    const embed = new EmbedBuilder()
      .setTitle('🎬 Upcoming Movies')
      .setColor(config.embedHex)
      .setFooter({ text: config.footerText });

    results.forEach(movie => {
      embed.addFields({
        name: `${movie.title} (${movie.release_date})`,
        value: movie.overview?.slice(0, 100) + '...' || 'No description available.',
        inline: false
      });
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
