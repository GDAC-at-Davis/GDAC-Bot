import { Client, GatewayIntentBits, Collection, Partials, Snowflake } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { extendedClient } from './extended-client.js';

const baseClient: Client<true> = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
    ],
    partials: [
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.Channel
    ]
});

const client = new extendedClient(baseClient);

client.commands = new Collection();

const _filename = fileURLToPath(import.meta.url);

const _src_dirname = path.dirname(_filename);

export { client, _src_dirname };
