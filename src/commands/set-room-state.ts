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
        .setName('set_room_state')
        .addIntegerOption(option =>
            option
                .setName('state')
                .setDescription(
                    '0 is closed, 1 is open, 2 is dependent on officer presence'
                )
                .setRequired(true)
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

        var newState =
            interaction.options.getInteger('state') ?? roomInfo.getroomOpenState();

        var success = roomInfo.setroomOpenState(newState);

        if (!success) {
            await interaction.reply({
                content: 'Set room open/closed failed.',
                ephemeral: true
            });
            return;
        } else {
            await interaction.reply({
                content: `Set room state to ${newState}.`,
                ephemeral: true
            });
        }
    }
} as CommandData;
