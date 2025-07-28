const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('actor')
    .setDescription('Searches for an actor/celebrity by name')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the person')
        .setRequired(true)
    ),

  async execute(interaction, config) {
    const name = interaction.options.getString('name');
    await interaction.deferReply();

    const res = await fetch(`${config.tmdbApiUrl}/search/person?query=${encodeURIComponent(name)}`, {
      headers: {
        Authorization: `Bearer ${config.tmdbApiToken}`
      }
    });

    const data = await res.json();
    const person = data.results?.[0];

    if (!person) return interaction.editReply({ content: '❌ No actor/celebrity found.' });

    const embed = new EmbedBuilder()
      .setTitle(person.name)
      .setDescription(person.known_for_department || 'No department info.')
      .setColor(config.embedHex)
      .addFields(
        { name: 'Popularity', value: person.popularity.toFixed(1), inline: true },
        { name: 'Known For', value: person.known_for?.map(i => i.title || i.name).slice(0, 3).join(', ') || 'None', inline: true }
      )
      .setThumbnail(`https://image.tmdb.org/t/p/w500${person.profile_path}`)
      .setFooter({ text: config.footerText });

    await interaction.editReply({ embeds: [embed] });
  }
};
