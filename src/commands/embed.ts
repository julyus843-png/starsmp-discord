import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel,
  PermissionsBitField,
} from "discord.js";

export const embed = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Send a custom embed message to a channel.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((opt) =>
      opt.setName("title").setDescription("Embed title.").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("description").setDescription("Embed body text.").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("color").setDescription("Hex color (e.g. #FF5733). Default: #5865F2").setRequired(false)
    )
    .addStringOption((opt) =>
      opt.setName("footer").setDescription("Footer text.").setRequired(false)
    )
    .addStringOption((opt) =>
      opt.setName("image").setDescription("Image URL to attach to the embed.").setRequired(false)
    )
    .addChannelOption((opt) =>
      opt.setName("channel").setDescription("Channel to send to (defaults to current channel).").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const title = interaction.options.getString("title", true);
    const description = interaction.options.getString("description", true);
    const colorInput = interaction.options.getString("color") ?? "#5865F2";
    const footer = interaction.options.getString("footer");
    const image = interaction.options.getString("image");
    const channelOpt = interaction.options.getChannel("channel");

    const colorHex = colorInput.replace("#", "");
    const color = parseInt(colorHex, 16);
    if (isNaN(color)) {
      return interaction.reply({ content: "Invalid hex color. Use format like `#FF5733`.", ephemeral: true });
    }

    const targetChannel = (channelOpt ?? interaction.channel) as TextChannel | null;

    if (!targetChannel || !("send" in targetChannel)) {
      return interaction.reply({ content: "Cannot send to that channel.", ephemeral: true });
    }

    const botMember = interaction.guild?.members.me;
    if (botMember) {
      const perms = targetChannel.permissionsFor(botMember);
      if (!perms?.has(PermissionsBitField.Flags.SendMessages)) {
        return interaction.reply({
          content: `❌ I don't have permission to send messages in <#${targetChannel.id}>. Please give me the **Send Messages** permission in that channel.`,
          ephemeral: true,
        });
      }
      if (!perms?.has(PermissionsBitField.Flags.EmbedLinks)) {
        return interaction.reply({
          content: `❌ I don't have permission to embed links in <#${targetChannel.id}>. Please give me the **Embed Links** permission in that channel.`,
          ephemeral: true,
        });
      }
    }

    const embedBuilder = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    if (footer) embedBuilder.setFooter({ text: footer });
    if (image) embedBuilder.setImage(image);

    await targetChannel.send({ embeds: [embedBuilder] });

    return interaction.reply({ content: `✅ Embed sent to <#${targetChannel.id}>.`, ephemeral: true });
  },
};
