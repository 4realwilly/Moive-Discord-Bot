const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('popularactors')
    .setDescription('Shows trending/popular actors'),

  async execute(interaction, config) {
    await interaction.deferReply();

    const res = await fetch(`${config.tmdbApiUrl}/person/popular`, {
      headers: { Authorization: `Bearer ${config.tmdbApiToken}` }
    });

    const data = await res.json();
    const top = data.results.slice(0, 5);

    const embed = new EmbedBuilder()
      .setTitle('👥 Popular Actors')
      .setColor(config.embedHex)
      .setFooter({ text: config.footerText });

    top.forEach((person, i) => {
      embed.addFields({
        name: `#${i + 1} ${person.name}`,
        value: `Known for: ${person.known_for?.map(k => k.title || k.name).slice(0, 2).join(', ')}`,
        inline: false
      });
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
