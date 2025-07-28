const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('searchall')
    .setDescription('Search for a movie or TV show and browse results')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Title of the movie or TV show')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('genre')
        .setDescription('Filter by genre keyword (optional)')
        .setRequired(false)
    ),

  async execute(interaction, config) {
    const query = interaction.options.getString('query');
    const genreFilter = interaction.options.getString('genre')?.toLowerCase();
    await interaction.deferReply();

    const res = await fetch(`${config.tmdbApiUrl}/search/multi?query=${encodeURIComponent(query)}&include_adult=false`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const data = await res.json();
    let results = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');

    if (genreFilter) {
      results = results.filter(r =>
        r.genre_ids && r.genre_ids.length > 0 && JSON.stringify(r).toLowerCase().includes(genreFilter)
      );
    }

    if (!results.length) return interaction.editReply({ content: '❌ No results found.' });

    let index = 0;

    const getEmbed = () => {
      const item = results[index];
      const title = item.title || item.name;
      const overview = item.overview || 'No description.';
      const type = item.media_type === 'tv' ? 'TV Show' : 'Movie';
      const date = item.release_date || item.first_air_date || 'Unknown';
      const rating = item.vote_average?.toFixed(1) || 'N/A';

      return new EmbedBuilder()
        .setTitle(`${title} (${type})`)
        .setDescription(overview.slice(0, 500) + (overview.length > 500 ? '...' : ''))
        .addFields(
          { name: 'Release Date', value: date, inline: true },
          { name: 'Rating', value: `${rating}/10`, inline: true }
        )
        .setThumbnail(item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null)
        .setColor(config.embedHex)
        .setFooter({ text: `Result ${index + 1} of ${results.length} • ${config.footerText}` });
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('⏮️ Prev')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('⏭️ Next')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(results.length <= 1)
    );

    const message = await interaction.editReply({ embeds: [getEmbed()], components: [row] });

    const collector = message.createMessageComponentCollector({ time: 60_000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'You are not allowed to interact with this.', ephemeral: true });
      }

      if (i.customId === 'next') index++;
      if (i.customId === 'prev') index--;

      row.components[0].setDisabled(index === 0);
      row.components[1].setDisabled(index === results.length - 1);

      await i.update({ embeds: [getEmbed()], components: [row] });
    });

    collector.on('end', () => {
      row.components.forEach(btn => btn.setDisabled(true));
      message.edit({ components: [row] }).catch(() => {});
    });
  }
};
