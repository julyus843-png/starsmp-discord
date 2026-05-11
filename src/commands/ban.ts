import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export const ban = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Permanently ban a member from the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to ban.").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the ban.").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided.";
    const guild = interaction.guild!;

    const member = await guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: "That user is not in this server.", ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: "I cannot ban that user (insufficient permissions or higher role).", ephemeral: true });
    }

    await member.ban({ reason: `${interaction.user.tag}: ${reason}` });

    return interaction.reply({
      content: `✅ **${target.tag}** has been permanently banned.\n**Reason:** ${reason}`,
    });
  },
};
