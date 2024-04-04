import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder
} from 'discord.js';

import { CommandData, CommandType } from '../utilities.js';
import { allServerData, roomInfo } from '../client.js';

export default {
    type: CommandType.GLOBAL,
    data: new SlashCommandBuilder()
        .setName('get_room')
        .setDescription('Get the room name for the server.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const serverId = interaction.guild?.id;
        const server = allServerData.get(serverId ?? '');
        if (server === undefined) {
            await interaction.reply({
                content: 'Server data not found',
                ephemeral: true
            });
            return;
        }

        await interaction.reply({
            content: `Server room name is ${roomInfo.getRoomName()}`,
            ephemeral: true
        });
    }
} as CommandData;
