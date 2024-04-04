import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { CommandData, CommandType } from '../utilities.js';

export default {
    type: CommandType.GLOBAL,
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute(interaction: ChatInputCommandInteraction) {
        // return time delay between sending the command and receiving the response
        const timeDelay = Date.now() - interaction.createdTimestamp;
        await interaction.reply({
            content: `Pong! ${timeDelay}ms`,
            ephemeral: true
        });
    }
} as CommandData;
