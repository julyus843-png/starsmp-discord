import { Client, GatewayIntentBits, Events } from "discord.js";
import { commands } from "./commands/index.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.MessageContent,
  ],
});

const commandMap = new Map(commands.map((c) => [c.data.name, c]));
const BANNED_WORDS = ["nigger", "nigga"];
const AUTOMOD_TIMEOUT_MS = 5 * 60 * 1000;

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  console.log(`Serving ${commandMap.size} commands.`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  const content = message.content.toLowerCase();
  const triggered = BANNED_WORDS.some((word) => content.includes(word));
  if (!triggered) return;
  const member = await message.guild.members.fetch(message.author.id).catch(() => null);
  if (!member) return;
  await message.delete().catch(() => null);
  if (member.moderatable) {
    await member.timeout(AUTOMOD_TIMEOUT_MS, "Auto-mod: slur used in chat").catch(() => null);
  }
  await message.channel.send(`Bad <@${message.author.id}>, Dont Say That`).catch(() => null);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commandMap.get(interaction.commandName);
  if (!command) {
    await interaction.reply({ content: "Unknown command.", ephemeral: true });
    return;
  }
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Error in /${interaction.commandName}:`, err);
    const msg = { content: "An error occurred running that command.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
