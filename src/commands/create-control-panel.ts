import {
    ChatInputCommandInteraction,
    GuildMember,
    SlashCommandBuilder,
    TextBasedChannel,
    TextChannel
} from 'discord.js';

import { commandData } from '../utilities.js';
import { allServerData } from '../client.js';

export default {
    data: new SlashCommandBuilder()
        .setName('create_control_panel')
        .setDescription('Create a control panel with buttons for officers to join and leave'),
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

        server.createControlPanel(channel);

        await interaction.reply({
            content: 'Display created',
            ephemeral: true
        });
    }
} as commandData;
