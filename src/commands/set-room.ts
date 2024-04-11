import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder
} from 'discord.js';

import { CommandData, CommandType } from '../utilities.js';
import { allServerData, roomInfo } from '../client.js';
import { GuildInfo } from '../info/guild-info.js';
import { backupServerSettings } from '../backup.js';
import { RoomInfo } from '../info/room-info.js';

export default {
    type: CommandType.RESTRICTED,
    data: new SlashCommandBuilder()
        .setName('set_room')
        .setDescription('Set room name for the server.')
        .addStringOption(option =>
            option.setName('room-name').setDescription('set room name').setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const roomName = interaction.options.getString('room-name');
        if (interaction.guild === undefined || interaction.guild === null) {
            await interaction.reply({
                content: 'Unexpected error: server not found',
                ephemeral: true
            });
            return;
        }
        const serverId = interaction.guild.id;
        var server = allServerData.get(serverId ?? '');
        if (server === undefined) {
            allServerData.set(serverId ?? '', new GuildInfo(interaction.guild));
            server = allServerData.get(serverId);
        }
        if (server === undefined) {
            await interaction.reply({
                content: 'Server data not found',
                ephemeral: true
            });
            return;
        }

        // member must have officer role
        const member = interaction.member as GuildMember;

        if (server.getOfficerRole() === null) {
            await interaction.reply({
                content: 'Officer role not set',
                ephemeral: true
            });
            return;
        }

        if (!member.roles.cache.has(server!.getOfficerRole() ?? '')) {
            await interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
            return;
        }

        await roomInfo.setRoomName(roomName);

        await interaction.reply({
            content: `Set room name to ${roomName}`,
            ephemeral: true
        });
    }
} as CommandData;
