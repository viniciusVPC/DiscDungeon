const { Schema, model } = require("mongoose");

const teamSchema = new Schema({
    leaderId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: false,
    },
    componentIds: [
        {
            type: String,
            required: true,
        },
    ],
    finished: {
        type: Boolean,
        default: false,
    },
});

module.exports = model("team", teamSchema);
