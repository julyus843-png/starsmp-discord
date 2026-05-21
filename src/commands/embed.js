import { EmbedBuilder, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from "discord.js";

export const embed = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Send a custom embed message to a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) => opt.setName("title").setDescription("Embed title.").setRequired(true))
    .addStringOption((opt) => opt.setName("description").setDescription("Embed body text.").setRequired(true))
    .addStringOption((opt) => opt.setName("color").setDescription("Hex color (e.g. #FF5733). Default: #5865F2").setRequired(false))
    .addStringOption((opt) => opt.setName("footer").setDescription("Footer text.").setRequired(false))
    .addStringOption((opt) => opt.setName("image").setDescription("Image URL.").setRequired(false))
    .addChannelOption((opt) => opt.setName("channel").setDescription("Channel to send to.").setRequired(false)),
  async execute(interaction) {
    const title = interaction.options.getString("title", true);
    const description = interaction.options.getString("description", true);
    const colorInput = interaction.options.getString("color") ?? "#5865F2";
    const footer = interaction.options.getString("footer");
    const image = interaction.options.getString("image");
    const channelOpt = interaction.options.getChannel("channel");
    const color = parseInt(colorInput.replace("#", ""), 16);
    if (isNaN(color)) return interaction.reply({ content: "Invalid hex color.", ephemeral: true });
    const targetChannel = channelOpt ?? interaction.channel;
    if (!targetChannel || !("send" in targetChannel)) return interaction.reply({ content: "Cannot send to that channel.", ephemeral: true });
    const botMember = interaction.guild?.members.me;
    if (botMember) {
      const perms = targetChannel.permissionsFor(botMember);
      if (!perms?.has(PermissionsBitField.Flags.ViewChannel)) return interaction.reply({ content: `❌ I don't have access to <#${targetChannel.id}>. Give me **View Channel** permission there.`, ephemeral: true });
      if (!perms?.has(PermissionsBitField.Flags.SendMessages)) return interaction.reply({ content: `❌ I need **Send Messages** permission in <#${targetChannel.id}>.`, ephemeral: true });
      if (!perms?.has(PermissionsBitField.Flags.EmbedLinks)) return interaction.reply({ content: `❌ I need **Embed Links** permission in <#${targetChannel.id}>.`, ephemeral: true });
    }
    const embedBuilder = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color).setTimestamp();
    if (footer) embedBuilder.setFooter({ text: footer });
    if (image) embedBuilder.setImage(image);
    await targetChannel.send({ embeds: [embedBuilder] });
    return interaction.reply({ content: `✅ Embed sent to <#${targetChannel.id}>.`, ephemeral: true });
  },
};
