const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('similar')
    .setDescription('Shows similar movies to a given one')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Movie title to find similar movies')
        .setRequired(true)
    ),

  async execute(interaction, config) {
    const title = interaction.options.getString('title');
    await interaction.deferReply();

    const search = await fetch(`${config.tmdbApiUrl}/search/movie?query=${encodeURIComponent(title)}`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const searchData = await search.json();
    const movie = searchData.results?.[0];
    if (!movie) return interaction.editReply({ content: '❌ Movie not found.' });

    const res = await fetch(`${config.tmdbApiUrl}/movie/${movie.id}/similar`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const data = await res.json();
    const similar = data.results.slice(0, 5);
    if (!similar.length) return interaction.editReply({ content: '❌ No similar movies found.' });

    const embed = new EmbedBuilder()
      .setTitle(`🎥 Similar to: ${movie.title}`)
      .setColor(config.embedHex)
      .setFooter({ text: config.footerText });

    similar.forEach(m => {
      embed.addFields({
        name: m.title,
        value: m.overview?.slice(0, 100) + '...',
        inline: false
      });
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
