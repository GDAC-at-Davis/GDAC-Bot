import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder
} from 'discord.js';

import { CommandData, CommandType } from '../utilities.js';
import { allServerData } from '../client.js';

export default {
    type: CommandType.RESTRICTED,
    isGlobal: false,
    data: new SlashCommandBuilder()
        .setName('force_clear_room')
        .setDescription('Force clear the room (In case anyone forgot to leave the room).'),
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

        const success = await server.removeAllOfficersFromRoom(member);

        if (!success) {
            await interaction.reply({
                content: 'Room is already empty.',
                ephemeral: true
            });
            return;
        } else {
            await interaction.reply({
                content: 'Cleared the room.',
                ephemeral: true
            });
        }
    }
} as CommandData;
