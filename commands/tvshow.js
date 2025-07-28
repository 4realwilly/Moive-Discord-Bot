const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tvshow')
    .setDescription('Searches for a TV show by name')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Name of the TV show')
        .setRequired(true)
    ),

  async execute(interaction, config) {
    const title = interaction.options.getString('title');
    await interaction.deferReply();

    const res = await fetch(`${config.tmdbApiUrl}/search/tv?query=${encodeURIComponent(title)}`, {
      headers: {
        Authorization: `Bearer ${config.tmdbApiToken}`
      }
    });

    const data = await res.json();
    const show = data.results?.[0];

    if (!show) return interaction.editReply({ content: '❌ No TV show found.' });

    const embed = new EmbedBuilder()
      .setTitle(show.name)
      .setDescription(show.overview || 'No description available.')
      .setColor(config.embedHex)
      .addFields(
        { name: 'First Air Date', value: show.first_air_date || 'Unknown', inline: true },
        { name: 'Rating', value: `${show.vote_average}/10 (${show.vote_count} votes)`, inline: true }
      )
      .setThumbnail(`https://image.tmdb.org/t/p/w500${show.poster_path}`)
      .setFooter({ text: config.footerText });

    await interaction.editReply({ embeds: [embed] });
  }
};
