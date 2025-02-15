const { Schema, model } = require("mongoose");

const preferencesSchema = new Schema({
  guildId: {
    type: String,
  },
  spamChannelId: {
    type: String,
  },
});

module.exports = model("preference", preferencesSchema);
