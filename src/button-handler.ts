import { ButtonInteraction, GuildMember, GuildMemberRoleManager } from 'discord.js';
import { allServerData } from './client.js';
/**
 * Handles button interactions.
 * @param interaction The interaction to handle.
 */
async function handleButton(interaction: ButtonInteraction): Promise<void> {
    const server = allServerData.get(interaction.guildId ?? '');
    if (server === undefined) {
        await interaction.reply({
            content: 'Server data not found',
            ephemeral: true
        });
        return;
    }
    const member = interaction.member as GuildMember;
    if (member === null) {
        await interaction.reply({
            content: 'Member data not found',
            ephemeral: true
        });
        return;
    }
    const officerRole = server.getOfficerRole();
    if (!member.roles.cache.has(server!.getOfficerRole() ?? '')) {
        await interaction.reply({
            content: 'You do not have permission to use this command.',
            ephemeral: true
        });
        return;
    }

    const action = interaction.customId;

    if (action === 'join') {
        const success = await server.addOfficerToRoom(member);
        if (!success) {
            await interaction.reply({
                content: 'You are already in the room',
                ephemeral: true
            });
            return;
        } else {
            await interaction.reply({
                content: 'You have joined the room',
                ephemeral: true
            });
        }
    } else if (action === 'leave') {
        const success = await server.removeOfficerFromRoom(member);
        if (!success) {
            await interaction.reply({
                content: 'You are not in the room',
                ephemeral: true
            });
            return;
        } else {
            await interaction.reply({
                content: 'You have left the room',
                ephemeral: true
            });
        }
    }
}

export { handleButton };
