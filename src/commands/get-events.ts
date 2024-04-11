import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

import { CommandData, CommandType } from '../utilities.js';
import { calendarInfo } from '../client.js';

export default {
    type: CommandType.RESTRICTED,
    data: new SlashCommandBuilder()
        .setName('get-events')
        .setDescription('Get events in the alt control lab!'),
    async execute(interaction: ChatInputCommandInteraction) {
        // return time delay between sending the command and receiving the response
        const timeDelay = Date.now() - interaction.createdTimestamp;

        await calendarInfo.refreshCalendar();

        const upcomingLabEvents = calendarInfo.getCurrentEvents();

        let events: string = '';

        for (const session of upcomingLabEvents) {
            events += `\n${session.eventSummary}:\nDescription: ${session.eventDescription}\nFrom ${session.startTime} to ${session.endTime}\n`;
        }

        await interaction.reply({
            content: `events: ${events} \n ${timeDelay}ms`
        });
    }
} as CommandData;
