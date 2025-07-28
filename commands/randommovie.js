const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randommovie')
    .setDescription('Shows a random popular movie'),

  async execute(interaction, config) {
    await interaction.deferReply();

    const randomPage = Math.floor(Math.random() * 10) + 1;
    const res = await fetch(`${config.tmdbApiUrl}/movie/popular?page=${randomPage}`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const data = await res.json();
    const movie = data.results[Math.floor(Math.random() * data.results.length)];

    const embed = new EmbedBuilder()
      .setTitle(movie.title)
      .setDescription(movie.overview || 'No description available.')
      .setColor(config.embedHex)
      .addFields(
        { name: 'Release Date', value: movie.release_date || 'Unknown', inline: true },
        { name: 'Rating', value: `${movie.vote_average}/10`, inline: true }
      )
      .setThumbnail(`https://image.tmdb.org/t/p/w500${movie.poster_path}`)
      .setFooter({ text: config.footerText });

    await interaction.editReply({ embeds: [embed] });
  }
};
