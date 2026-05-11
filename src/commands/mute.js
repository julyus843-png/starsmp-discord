import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

function parseDuration(input) {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[match[2].toLowerCase()];
}

const MAX_TIMEOUT_MS = 28 * 24 * 60 * 60 * 1000;

export const mute = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout (mute) a member. Max 28d.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName("user").setDescription("The user to mute.").setRequired(true))
    .addStringOption((opt) => opt.setName("duration").setDescription("Mute duration (e.g. 10m, 2h, 1d).").setRequired(true))
    .addStringOption((opt) => opt.setName("reason").setDescription("Reason for the mute.").setRequired(false)),
  async execute(interaction) {
    const target = interaction.options.getUser("user", true);
    const durationStr = interaction.options.getString("duration", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided.";
    const durationMs = parseDuration(durationStr);
    if (!durationMs) return interaction.reply({ content: "Invalid duration. Use e.g. `10m`, `2h`, `1d`.", ephemeral: true });
    if (durationMs > MAX_TIMEOUT_MS) return interaction.reply({ content: "Maximum timeout duration is 28 days.", ephemeral: true });
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: "That user is not in this server.", ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: "I cannot mute that user.", ephemeral: true });
    await member.timeout(durationMs, `${interaction.user.tag}: ${reason}`);
    return interaction.reply({ content: `🔇 **${target.tag}** has been muted for **${durationStr}**.\n**Reason:** ${reason}` });
  },
};
