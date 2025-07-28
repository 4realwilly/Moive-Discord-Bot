const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARN] The command at ${filePath} is missing "data" or "execute".`);
  }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('🔁 Deploying slash commands globally...');
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    console.log('✅ Slash commands deployed globally.');
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setActivity('Free Movies', { type: 'WATCHING' });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, config);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
  }
});

client.login(config.token);
