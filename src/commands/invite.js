import { EmbedBuilder, OAuth2Scopes, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export const invite = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get a link to add this bot to another server."),
  async execute(interaction) {
    const link = interaction.client.generateInvite({
      scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
      permissions: [
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.ModerateMembers,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ViewChannel,
      ],
    });
    const embed = new EmbedBuilder()
      .setTitle("➕ Add StarSMP Bot to your server")
      .setDescription(`[Click here to invite the bot](${link})`)
      .setColor(0x5865f2)
      .setFooter({ text: "This link includes all required permissions." });
    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
