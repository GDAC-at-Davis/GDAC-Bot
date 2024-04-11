import { Client, GatewayIntentBits, Collection, Partials, Snowflake } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { extendedClient } from './extended-client.js';
import { GuildInfo } from './info/guild-info.js';
import { RoomInfo } from './info/room-info.js';
import { CalendarInfo } from './info/calendar-info.js';

const baseClient: Client<true> = new Client({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.Channel
    ]
});

const client = new extendedClient(baseClient);

client.commands = new Collection();

const allServerData = new Collection<Snowflake, GuildInfo>();

const roomInfo = RoomInfo.getInstance();

const calendarInfo = CalendarInfo.getInstance();

const _filename = fileURLToPath(import.meta.url);

const _src_dirname = path.dirname(_filename);

export { client, allServerData, _src_dirname, roomInfo, calendarInfo };
