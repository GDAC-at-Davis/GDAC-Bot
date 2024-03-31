import {
    ActionRowBuilder,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
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

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
        joinButton,
        leaveButton
    );

    return {
        embeds: [
            {
                color: 0x00ff00,
                title: `${roomName} Control Panel`,
                description:
                    'Press the join button when you enter the room and the leave button when you leave.\
                \n\nOfficers currently in the room:',
                fields: officerList.map(member => {
                    return {
                        name: member.displayName,
                        value: member.toString()
                    };
                }),
                timestamp: new Date().toISOString()
            }
        ],
        components: [buttons]
    };
}

export { ControlPanelEmbed };
