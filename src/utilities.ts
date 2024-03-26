import { ChatInputCommandInteraction, SlashCommandBuilder, Snowflake } from 'discord.js';

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

type commandData = {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

type ChannelId = Snowflake;

export { notEmpty, ChannelId, commandData };
