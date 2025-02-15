const { Schema, model } = require("mongoose");

const levelSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    xp: {
        type: Number,
        default: 0,
    },
    level: {
        type: Number,
        default: 1,
    },
    isInTeam: {
        type: Boolean,
        default: false,
    },
    teamLeaderId: {
        type: String,
        required: false,
    },
});

module.exports = model("level", levelSchema);
