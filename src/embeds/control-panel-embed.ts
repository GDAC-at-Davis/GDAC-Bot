import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    EmbedData,
    GuildMember
} from 'discord.js';

function ControlPanelEmbed(
    officerList: GuildMember[],
    roomName: string
): BaseMessageOptions {
    const joinButton = new ButtonBuilder()
        .setCustomId('join')
        .setLabel('Join')
        .setEmoji('🚪')
        .setStyle(ButtonStyle.Primary);

    const leaveButton = new ButtonBuilder()
        .setCustomId('leave')
        .setLabel('Leave')
        .setEmoji('🚪')
        .setStyle(ButtonStyle.Danger);

    const refreshCalendarButton = new ButtonBuilder()
        .setCustomId('refresh-calendar')
        .setLabel('Refresh Calendar')
        .setEmoji('🔄')
        .setStyle(ButtonStyle.Secondary);

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        joinButton,
        leaveButton,
        refreshCalendarButton
    );

    const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`${roomName} Control Panel`)
        .setDescription(
            'Press the join button when you enter the room and the leave button when you leave.'
        )
        .addFields(
            officerList.map(member => {
                return {
                    name: member.displayName,
                    value: member.toString()
                };
            })
        )
        .setTimestamp(new Date());

    return {
        embeds: [embed],
        components: [buttons]
    };
}

export { ControlPanelEmbed };
