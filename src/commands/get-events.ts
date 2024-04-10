import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { CommandData, CommandType } from '../utilities.js';
import { fetchUpcomingLabEvents } from '../calendar-stuff.js';

export default {
    type: CommandType.GLOBAL,
    data: new SlashCommandBuilder().setName('get-events').setDescription('Get events in the alt control lab!'),
    async execute(interaction: ChatInputCommandInteraction) {
        // return time delay between sending the command and receiving the response
        const timeDelay = Date.now() - interaction.createdTimestamp;

        const upcomingLabEvents = await fetchUpcomingLabEvents();

        let events : string = "";

        for(const session of upcomingLabEvents) {
            events += `${session.eventSummary} - ${session.eventDescription}\n from ${session.startTime} to ${session.endTime}\n`;
        }

        await interaction.reply({
            content: `events: ${events} \n ${timeDelay}ms`
        });
    }
} as CommandData;
