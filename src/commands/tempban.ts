import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * multipliers[unit];
}

export const tempban = {
  data: new SlashCommandBuilder()
    .setName("tempban")
    .setDescription("Temporarily ban a member. Duration: 10s, 5m, 2h, 1d")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to temp-ban.").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("duration").setDescription("Ban duration (e.g. 10m, 2h, 1d).").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the ban.").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const durationStr = interaction.options.getString("duration", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided.";
    const guild = interaction.guild!;

    const durationMs = parseDuration(durationStr);
    if (!durationMs) {
      return interaction.reply({ content: "Invalid duration format. Use something like `10m`, `2h`, or `1d`.", ephemeral: true });
    }

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: "That user is not in this server.", ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: "I cannot ban that user (insufficient permissions or higher role).", ephemeral: true });
    }

    await member.ban({ reason: `[TEMPBAN ${durationStr}] ${interaction.user.tag}: ${reason}` });

    await interaction.reply({
      content: `✅ **${target.tag}** has been temp-banned for **${durationStr}**.\n**Reason:** ${reason}`,
    });

    setTimeout(async () => {
      await guild.members.unban(target.id, "Temporary ban expired.").catch(() => null);
    }, durationMs);
  },
};
