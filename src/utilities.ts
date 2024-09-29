import { ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from 'discord.js';

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

function toPstDisplayTime(date: Date): String {
    return date.toLocaleTimeString('en-US', {
        timeZone: 'America/Los_Angeles',
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
    });
}

enum CommandType {
    GLOBAL,
    RESTRICTED
}

type CommandData = {
    type: CommandType;
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

type ChannelId = Snowflake;

export { toPstDisplayTime, notEmpty, ChannelId, CommandType, CommandData };
