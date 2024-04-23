import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder
} from 'discord.js';

import { CommandData, CommandType } from '../utilities.js';
import { allServerData, roomInfo } from '../client.js';

export default {
    type: CommandType.RESTRICTED,
    isGlobal: false,
    data: new SlashCommandBuilder()
        .setName('toggle_room_open')
        .addBooleanOption(option =>
            option.setName('open').setDescription('Open the room').setRequired(true)
        )
        .setDescription('Set the room open/closed (same as using the web API)'),

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

        var open = interaction.options.getBoolean('open') ?? roomInfo.getIsRoomOpen();

        var success = roomInfo.setIsRoomOpen(open);

        if (!success) {
            await interaction.reply({
                content: 'Set room open/closed failed.',
                ephemeral: true
            });
            return;
        } else {
            await interaction.reply({
                content: `Set room to ${open ? "open" : "closed"}.`,
                ephemeral: true
            });
        }
    }
} as CommandData;
