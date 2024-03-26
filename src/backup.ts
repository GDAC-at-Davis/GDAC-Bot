import { _src_dirname } from './client.js';
import { allServerData } from './client.js';

import fs from 'node:fs';
import { GuildInfo, GuildInfoBackup } from './guild-info.js';
import path from 'path';
import { Snowflake, Collection } from 'discord.js';

type backupData = {
    [key: string]: GuildInfoBackup;
};

async function backupServerSettings(guildId: Snowflake): Promise<void> {
    const backups = new Collection<string, GuildInfoBackup>();

    allServerData.forEach((value, key) => {
        backups.set(key, value.toJSON());
    });

    const json = JSON.stringify(backups.toJSON());
    const backupFile = path.join(_src_dirname, '../../backups', 'server_settings.json');

    // create file if it doesn't exist already

    fs.writeFile(backupFile, json, { flag: 'w', encoding: 'utf8' }, err => {
        if (err) {
            console.error(err);
        }
    });
}

async function restoreServerSettings(): Promise<void> {
    const backupFile = path.join(_src_dirname, '../../backups', 'server_settings.json');
    // if file doesn't exist return
    if (!fs.existsSync(backupFile)) {
        return;
    }
    fs.readFile(backupFile, { encoding: 'utf8' }, (err, data) => {
        if (err) {
            console.error(err);
        }
        const backup = JSON.parse(data) as backupData;
        Object.keys(backup).forEach(async key => {
            const backupData = backup[key];
            if (backupData !== undefined) {
                const server = await GuildInfo.fromJSON(backupData).catch(err => {
                    console.error(err);
                });
                if (server === undefined) {
                    return;
                }
                const guildId = server.guild.id;
                allServerData.set(guildId, server);
                console.log('Restored server settings for ' + server.guild.name);
            }
        });
    });
}

export { backupServerSettings, restoreServerSettings };
