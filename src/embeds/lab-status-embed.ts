import { Base, BaseMessageOptions, EmbedBuilder, GuildMember } from 'discord.js';
import { LabEventModel, LabEventType } from '../info/calendar-info.js';

function LabStatusEmbed(
    officerList: GuildMember[],
    labEvents: LabEventModel[],
    roomName: string
): BaseMessageOptions {
    const isOpen = officerList.length > 0;
    const lastUpdated = new Date();

    let officerNames = officerList.map(member => member.toString()).join('\n');

    // Default embed, when no events are occuring
    let noEventEmbed = createNoEventEmbed(isOpen, roomName, lastUpdated, officerNames);

    let currentEventEmbed = null;

    let messageBuilder: BaseMessageOptions = {} as BaseMessageOptions;

    messageBuilder.embeds = [];

    const currentTimestamp = new Date();

    // Create an embed for listing calendar events
    let eventListingsEmbed = new EmbedBuilder()
        .setColor(0x50ddf2)
        .setTitle("Today's Lab Schedule")
        .setTimestamp(lastUpdated);

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
        .setTitle(`${roomName} Status Tracker!`)
        .setDescription(`The coolest room on campus, probably`);

    messageBuilder.embeds.unshift(headerEmbed);

    return messageBuilder;
}

function formatTimeRange(event: LabEventModel): string {
    let startTime = event.startTime.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
    });

    let endTime = event.endTime.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
    });

    return `${startTime} - ${endTime}`;
}

function createNoEventEmbed(
    isOpen: boolean,
    roomName: string,
    lastUpdated: Date,
    officerNames: string
): EmbedBuilder {
    let statusEmbedBuilder = new EmbedBuilder();
    if (!isOpen) {
        statusEmbedBuilder
            .setColor(0xff0000)
            .setTitle(`CURRENTLY CLOSED`)
            .setDescription('No people in the room right now...')
            .setTimestamp(lastUpdated);
    } else {
        statusEmbedBuilder
            .setColor(0x00ff00)
            .setTitle(`CURRENTLY OPEN (Come visit!)`)
            .setDescription(
                `People making sure the place doesn't burn down: \n${officerNames}`
            )
            .setTimestamp(lastUpdated);
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
