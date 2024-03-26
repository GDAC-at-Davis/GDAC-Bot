import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder
} from 'discord.js';

import { commandData } from '../utilities.js';
import { allServerData } from '../client.js';
import { DisplayEmebed } from '../display-embed.js';

export default {
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

        const embed = DisplayEmebed(server.getOfficersInRoom(), server.getRoomName() ?? '‼️Room Name Not Set‼️');
        const channel = interaction.channel;

        await channel?.send(embed);
        await interaction.reply({
            content: 'Display created',
            ephemeral: true
        });
    }
} as commandData;
