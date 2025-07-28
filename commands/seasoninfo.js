const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seasoninfo')
    .setDescription('Get info about a TV show season')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('TV Show title')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('season')
        .setDescription('Season number')
        .setRequired(true)
    ),

  async execute(interaction, config) {
    const title = interaction.options.getString('title');
    const seasonNumber = interaction.options.getInteger('season');

    await interaction.deferReply();

    const searchRes = await fetch(`${config.tmdbApiUrl}/search/tv?query=${encodeURIComponent(title)}`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const searchData = await searchRes.json();
    const show = searchData.results?.[0];
    if (!show) return interaction.editReply({ content: '❌ TV Show not found.' });

    const seasonRes = await fetch(`${config.tmdbApiUrl}/tv/${show.id}/season/${seasonNumber}`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const season = await seasonRes.json();
    if (!season || season.status_code) return interaction.editReply({ content: '❌ Season not found.' });

    const embed = new EmbedBuilder()
      .setTitle(`${show.name} – Season ${season.season_number}`)
      .setDescription(season.overview || 'No description available.')
      .setColor(config.embedHex)
      .addFields({ name: 'Episodes', value: `${season.episodes.length}`, inline: true })
      .setFooter({ text: config.footerText });

    await interaction.editReply({ embeds: [embed] });
  }
};
