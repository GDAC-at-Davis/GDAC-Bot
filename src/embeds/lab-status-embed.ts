import { Base, BaseMessageOptions, EmbedBuilder, GuildMember } from 'discord.js';
import { LabEventModel, LabEventType } from '../info/calendar-info.js';
import { RoomInfo } from '../info/room-info.js';
import { toPstDisplayTime } from '../utilities.js';

function LabStatusEmbed(
    officerList: GuildMember[],
    labEvents: LabEventModel[],
    roomInfo: RoomInfo
): BaseMessageOptions {
    const roomName = roomInfo.getRoomName() ?? '‼️Room Name Not Set‼️';
    const roomOpenState = roomInfo.getroomOpenState();
    const isOpen = roomOpenState === 1 || (roomOpenState === 2 && officerList.length > 0);
    const lastUpdated = new Date();
    const currentTimestamp = new Date();
    const officerNames = officerList.map(member => member.toString()).join('\n');

    let messageBuilder: BaseMessageOptions = {} as BaseMessageOptions;
    messageBuilder.embeds = [];

    // Default embed, when no events are occuring
    let noEventEmbed = createNoEventEmbed(isOpen, roomName, lastUpdated, officerNames);

    let currentEventEmbed = null;
    // Create an embed for listing calendar events
    let eventListingsEmbed = new EmbedBuilder()
        .setColor(0x50ddf2)
        .setTitle("Today's Schedule");

    for (const event of labEvents) {
        // is it occuring right now?
        const isOccuring =
            event.startTime < currentTimestamp && event.endTime > currentTimestamp;

        if (isOccuring) {
            currentEventEmbed = createCurrentEventEmbed(event, roomName, officerNames);
            continue;
        }

        eventListingsEmbed.addFields({
            name: `**${event.eventSummary}**`,
            value: `${event.eventDescription}\n*${formatTimeRange(event)}*`
        });
    }

    if (currentEventEmbed !== null) {
        messageBuilder.embeds.unshift(currentEventEmbed);
    } else {
        messageBuilder.embeds.unshift(noEventEmbed);
    }

    messageBuilder.embeds.push(eventListingsEmbed);

    let headerEmbed = new EmbedBuilder()
        .setColor(0xffffff)
        .setTitle(`${roomName} Status`)
        .setDescription(`Last Updated: ${toPstDisplayTime(lastUpdated)}`);

    messageBuilder.embeds.unshift(headerEmbed);

    return messageBuilder;
}

function formatTimeRange(event: LabEventModel): string {
    let startTime = toPstDisplayTime(event.startTime);

    let endTime = toPstDisplayTime(event.endTime);

    return `${startTime} - ${endTime}`;
}

function createNoEventEmbed(
    isOpen: boolean,
    roomName: string,
    lastUpdated: Date,
    officerNames: string
): EmbedBuilder {
    let statusEmbedBuilder = new EmbedBuilder();

    var officerDisplay =
        officerNames.length > 0 ? `\nOfficers in the room: \n${officerNames}\n` : '';

    if (!isOpen) {
        statusEmbedBuilder
            .setColor(0xff0000)
            .setTitle(`CURRENTLY CLOSED`)
            .setDescription('(probably)')
            .setTimestamp(lastUpdated);
    } else {
        statusEmbedBuilder
            .setColor(0x00ff00)
            .setTitle(`CURRENTLY OPEN`)
            .setDescription(
                `**Come and do work or just chill!**
                ${officerDisplay}
                ദ്ദി ˉ꒳ˉ )✧
                `
            );
    }

    return statusEmbedBuilder;
}

function eventTypeToColor(eventType: LabEventType): number {
    switch (eventType) {
        case LabEventType.Class:
            return 0xffff00;
        case LabEventType.OpenLab:
            return 0x00ff00;
        case LabEventType.Meeting:
            return 0xfc8244;
        default:
            return 0xaaaaaa;
    }
}

function createCurrentEventEmbed(
    event: LabEventModel,
    roomName: string,
    officerNames: string
): EmbedBuilder {
    let color = eventTypeToColor(event.eventType);

    let presentOfficersNames = officerNames.length > 0 ? 'In Room: ' + officerNames : '';

    var embedBuilder = new EmbedBuilder()
        .setColor(color)
        .setTitle(`Current Event: ${event.eventSummary}`)
        .setDescription(`${event.eventDescription}\n${presentOfficersNames}`)
        .setFooter({
            text: formatTimeRange(event)
        });

    if (event.eventType === LabEventType.Class) {
        return embedBuilder;
    } else if (event.eventType === LabEventType.OpenLab) {
        return embedBuilder;
    } else if (event.eventType === LabEventType.Meeting) {
        return embedBuilder;
    } else {
        return embedBuilder;
    }
}

export { LabStatusEmbed };
