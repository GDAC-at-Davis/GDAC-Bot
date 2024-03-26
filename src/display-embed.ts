import { BaseMessageOptions, GuildMember } from 'discord.js';

type EmbedData = Pick<BaseMessageOptions, 'embeds'>;

function DisplayEmebed(officerList: GuildMember[], roomName: string): EmbedData {
    const isOpen = officerList.length > 0;
    if (!isOpen) {
        return {
            embeds: [
                {
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
                title: `${roomName} is open`,
                description: `Officers in the room: \n${officerNames}`
            }
        ]
    };
}

export { DisplayEmebed };