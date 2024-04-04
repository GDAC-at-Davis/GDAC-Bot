import {
    ChatInputCommandInteraction,
    GuildMember,
    PermissionsBitField,
    SlashCommandBuilder
} from 'discord.js';

import { CommandData, CommandType } from '../utilities.js';
import { allServerData } from '../client.js';
import { GuildInfo } from '../guild-info.js';

export default {
    type: CommandType.RESTRICTED,
    data: new SlashCommandBuilder()
        .setName('set_officer_role')
        .setDescription('Replies with Pong!')
        .addRoleOption(option =>
            option
                .setName('officer-role')
                .setDescription('set officer role')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        // only server admin can run this command
        const member = interaction.member as GuildMember;
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
            return;
        }
        if (interaction.guild === undefined || interaction.guild === null) {
            await interaction.reply({
                content: 'Unexpected error: server not found',
                ephemeral: true
            });
            return;
        }

        const officerRole = interaction.options.getRole('officer-role');
        if (officerRole === null) {
            await interaction.reply({
                content: 'Unexpected error: officer role not found',
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

        await server!.setOfficerRole(officerRole.id);

        await interaction.reply({
            content: `Set officer role to ${officerRole.toString()}`,
            ephemeral: true
        });
    }
} as CommandData;
