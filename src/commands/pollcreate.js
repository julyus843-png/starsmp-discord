import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

const POLL_EMOJIS = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

export const pollcreate = {
  data: new SlashCommandBuilder()
    .setName("pollcreate")
    .setDescription("Create a poll with up to 10 options.")
    .addStringOption((opt) => opt.setName("question").setDescription("The poll question.").setRequired(true))
    .addStringOption((opt) => opt.setName("option1").setDescription("Option 1").setRequired(true))
    .addStringOption((opt) => opt.setName("option2").setDescription("Option 2").setRequired(true))
    .addStringOption((opt) => opt.setName("option3").setDescription("Option 3").setRequired(false))
    .addStringOption((opt) => opt.setName("option4").setDescription("Option 4").setRequired(false))
    .addStringOption((opt) => opt.setName("option5").setDescription("Option 5").setRequired(false))
    .addStringOption((opt) => opt.setName("option6").setDescription("Option 6").setRequired(false))
    .addStringOption((opt) => opt.setName("option7").setDescription("Option 7").setRequired(false))
    .addStringOption((opt) => opt.setName("option8").setDescription("Option 8").setRequired(false))
    .addStringOption((opt) => opt.setName("option9").setDescription("Option 9").setRequired(false))
    .addStringOption((opt) => opt.setName("option10").setDescription("Option 10").setRequired(false)),
  async execute(interaction) {
    const question = interaction.options.getString("question", true);
    const options = [];
    for (let i = 1; i <= 10; i++) {
      const val = interaction.options.getString(`option${i}`);
      if (val) options.push(val);
    }
    const description = options.map((opt, i) => `${POLL_EMOJIS[i]} ${opt}`).join("\n");
    const embed = new EmbedBuilder()
      .setTitle(`📊 ${question}`)
      .setDescription(description)
      .setColor(0x5865f2)
      .setFooter({ text: `Poll by ${interaction.user.tag}` })
      .setTimestamp();
    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < options.length; i++) {
      await message.react(POLL_EMOJIS[i]);
    }
  },
};
