import { BaseMessageOptions, GuildMember } from 'discord.js';

function DisplayEmbed(officerList: GuildMember[], roomName: string): BaseMessageOptions {
    const isOpen = officerList.length > 0;
    const lastUpdated = new Date().toISOString();
    if (!isOpen) {
        return {
            embeds: [
                {
                    color: 0xff0000,
                    title: `${roomName} is closed`,
                    description: 'No officers are currently in the room',
                    timestamp: lastUpdated
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
                description: `Officers in the room: \n${officerNames}`,
                timestamp: lastUpdated
            }
        ]
    };
}

export { DisplayEmbed };
