import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { commandData } from '../utilities.js';

export default {
    data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
    async execute(interaction: ChatInputCommandInteraction) {
        // return time delay between sending the command and receiving the response
        const timeDelay = Date.now() - interaction.createdTimestamp;
        await interaction.reply(`Pong! ${timeDelay}ms`);
    }
} as commandData;
