const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('movie')
    .setDescription('Searches for a movie by name')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Name of the movie')
        .setRequired(true)
    ),

  async execute(interaction, config) {
    const query = interaction.options.getString('title');

    await interaction.deferReply();

    const response = await fetch(`${config.tmdbApiUrl}/search/movie?query=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${config.tmdbApiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return interaction.editReply({ content: '❌ Failed to fetch movie data.' });
    }

    const data = await response.json();
    const movie = data.results?.[0];

    if (!movie) {
      return interaction.editReply({ content: '❌ No results found.' });
    }

    const embed = new EmbedBuilder()
      .setTitle(movie.title)
      .setDescription(movie.overview || 'No description available.')
      .setColor(config.embedHex)
      .addFields(
        { name: 'Release Date', value: movie.release_date || 'Unknown', inline: true },
        { name: 'Rating', value: `${movie.vote_average}/10 (${movie.vote_count} votes)`, inline: true }
      )
      .setThumbnail(`https://image.tmdb.org/t/p/w500${movie.poster_path}`)
      .setFooter({ text: config.footerText });

    await interaction.editReply({ embeds: [embed] });
  }
};
