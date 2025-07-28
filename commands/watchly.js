const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('watchly')
    .setDescription('Get the link to Watchly — stream movies and TV shows for free'),

  async execute(interaction, config) {
    const embed = new EmbedBuilder()
      .setTitle('🎬 Watchly – Watch TV Shows & Movies Online')
      .setDescription('Step into a world where entertainment knows no boundaries.\n\n**Watchly** brings your screen to life with:\n\n'
        + '• 📚 **Vast Library** — Thousands of movies & shows\n'
        + '• 🧠 **Smart Recommendations** — Tailored for you\n'
        + '• 📱 **All Devices** — TVs, phones, tablets & more\n'
        + '• 🔒 **Privacy First** — No login, no signup\n'
        + '• 🖥️ **4K Streaming** — HD, UHD & HDR content\n'
        + '• 💸 **Totally Free** — No credit card needed')
      .setColor(config.embedHex)
      .setFooter({ text: 'Made with ❤️  by 4RealWilly • 2025 Watchly' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🎥 Watch Now')
        .setStyle(ButtonStyle.Link)
        .setURL('https://watchly.qzz.io/')
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
