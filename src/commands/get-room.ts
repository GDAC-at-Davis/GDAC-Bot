import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder
} from 'discord.js';

import { commandData } from '../utilities.js';
import { allServerData } from '../client.js';

export default {
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

        // member must have officer role
        const member = interaction.member as GuildMember;
        if (
            server.getOfficerRole() !== null &&
            !member.roles.cache.has(server.getOfficerRole() ?? '')
        ) {
            await interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
            return;
        }

        await interaction.reply({
            content: `Server room name is ${server.getRoomName()}`,
            ephemeral: true
        });
    }
} as commandData;
