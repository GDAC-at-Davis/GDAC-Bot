import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder,
    TextBasedChannel,
    TextChannel
} from 'discord.js';

import { CommandData, CommandType } from '../utilities.js';
import { allServerData } from '../client.js';

export default {
    type: CommandType.GLOBAL,
    data: new SlashCommandBuilder()
        .setName('new_display')
        .setDescription('Create new display for server'),
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

        const channel = interaction.channel as TextBasedChannel;

        await server.createNewDisplay(channel);

        await interaction.reply({
            content: 'Display created',
            ephemeral: true
        });
    }
} as CommandData;
