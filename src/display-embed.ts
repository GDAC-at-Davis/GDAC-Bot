import { BaseMessageOptions, GuildMember } from 'discord.js';

type EmbedData = Pick<BaseMessageOptions, 'embeds'>;

function DisplayEmbed(officerList: GuildMember[], roomName: string): EmbedData {
    const isOpen = officerList.length > 0;
    if (!isOpen) {
        return {
            embeds: [
                {
                    color: 0xff0000,
                    title: `${roomName} is closed`,
                    description: 'No officers are currently in the room'
                }
            ]
        };
    }
    const officerNames = officerList.map(member => member.toString()).join('\n');
    return {
        embeds: [
            {
                color: 0x00ff00,
                title: `${roomName} is open`,
                description: `Officers in the room: \n${officerNames}`
            }
        ]
    };
}

export { DisplayEmbed };