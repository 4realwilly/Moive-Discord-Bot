const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trending')
    .setDescription('Shows trending movies or TV shows')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of content')
        .setRequired(true)
        .addChoices(
          { name: 'Movie', value: 'movie' },
          { name: 'TV Show', value: 'tv' },
          { name: 'All', value: 'all' }
        )
    ),

  async execute(interaction, config) {
    const type = interaction.options.getString('type');
    await interaction.deferReply();

    const res = await fetch(`${config.tmdbApiUrl}/trending/${type}/week`, {
      headers: {
        Authorization: `Bearer ${config.tmdbApiToken}`
      }
    });

    const data = await res.json();
    const results = data.results.slice(0, 5);

    if (!results.length) return interaction.editReply({ content: '❌ No trending content found.' });

    const embed = new EmbedBuilder()
      .setTitle(`🔥 Trending ${type === 'all' ? 'Content' : type === 'movie' ? 'Movies' : 'TV Shows'}`)
      .setColor(config.embedHex)
      .setFooter({ text: config.footerText });

    results.forEach((item, i) => {
      embed.addFields({
        name: `#${i + 1} ${item.title || item.name}`,
        value: `${item.overview?.slice(0, 100) || 'No description.'}...`,
        inline: false
      });
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
