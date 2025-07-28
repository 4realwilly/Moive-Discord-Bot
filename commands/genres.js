const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('genres')
    .setDescription('List available movie or TV genres')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Movie or TV genres')
        .setRequired(true)
        .addChoices({ name: 'Movie', value: 'movie' }, { name: 'TV', value: 'tv' })
    ),

  async execute(interaction, config) {
    const type = interaction.options.getString('type');
    await interaction.deferReply();

    const res = await fetch(`${config.tmdbApiUrl}/genre/${type}/list`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const data = await res.json();
    const genres = data.genres.map(g => `• ${g.name}`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`${type === 'movie' ? '🎬 Movie Genres' : '📺 TV Genres'}`)
      .setDescription(genres || 'No genres found.')
      .setColor(config.embedHex)
      .setFooter({ text: config.footerText });

    await interaction.editReply({ embeds: [embed] });
  }
};
