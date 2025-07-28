const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('toprated')
    .setDescription('Shows top-rated movies or TV shows')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Choose content type')
        .setRequired(true)
        .addChoices(
          { name: 'Movies', value: 'movie' },
          { name: 'TV Shows', value: 'tv' }
        )
    ),

  async execute(interaction, config) {
    const type = interaction.options.getString('type');
    await interaction.deferReply();

    const res = await fetch(`${config.tmdbApiUrl}/${type}/top_rated`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const data = await res.json();
    const items = data.results.slice(0, 5);

    if (!items.length) return interaction.editReply({ content: '❌ No results.' });

    const embed = new EmbedBuilder()
      .setTitle(`⭐ Top Rated ${type === 'movie' ? 'Movies' : 'TV Shows'}`)
      .setColor(config.embedHex)
      .setFooter({ text: config.footerText });

    items.forEach(item => {
      embed.addFields({
        name: `${item.title || item.name}`,
        value: `Rating: ${item.vote_average}/10\n${item.overview?.slice(0, 100) + '...'}`,
        inline: false
      });
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
