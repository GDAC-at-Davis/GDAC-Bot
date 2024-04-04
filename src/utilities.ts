import { ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from 'discord.js';

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
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

export { notEmpty, ChannelId, CommandType, CommandData };
