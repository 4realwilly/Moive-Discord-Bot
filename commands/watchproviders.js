const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('watchproviders')
    .setDescription('Get where you can watch a movie')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Movie title')
        .setRequired(true)
    ),

  async execute(interaction, config) {
    const title = interaction.options.getString('title');
    await interaction.deferReply();

    const searchRes = await fetch(`${config.tmdbApiUrl}/search/movie?query=${encodeURIComponent(title)}`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const searchData = await searchRes.json();
    const movie = searchData.results?.[0];

    if (!movie) return interaction.editReply({ content: '❌ Movie not found.' });

    const providerRes = await fetch(`${config.tmdbApiUrl}/movie/${movie.id}/watch/providers`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const providerData = await providerRes.json();
    const us = providerData.results?.['US'];

    if (!us) return interaction.editReply({ content: '❌ No provider info found for US region.' });

    const embed = new EmbedBuilder()
      .setTitle(`📺 Watch Providers for: ${movie.title}`)
      .setColor(config.embedHex)
      .setFooter({ text: config.footerText });

    if (us.flatrate) {
      embed.addFields({ name: 'Streaming (Subscription)', value: us.flatrate.map(p => p.provider_name).join(', ') });
    }

    if (us.rent) {
      embed.addFields({ name: 'Rent', value: us.rent.map(p => p.provider_name).join(', ') });
    }

    if (us.buy) {
      embed.addFields({ name: 'Buy', value: us.buy.map(p => p.provider_name).join(', ') });
    }

    await interaction.editReply({ embeds: [embed] });
  }
};
