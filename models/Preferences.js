const { Schema, model } = require("mongoose");

const preferencesSchema = new Schema({
  guildId: {
    type: String,
  },
  spamChannelId: {
    type: String,
  },
  vidaLimite: {
    type: Number,
  },
});

module.exports = model("preference", preferencesSchema);
