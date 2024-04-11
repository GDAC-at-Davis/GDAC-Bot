import { _src_dirname, roomInfo } from './client.js';
import { allServerData } from './client.js';

import fs from 'node:fs';
import { GuildInfo, GuildInfoBackup } from './info/guild-info.js';
import path from 'path';
import { Snowflake, Collection } from 'discord.js';
import { RoomInfo } from './info/room-info.js';
import { backupServerSettingsPath, backupRoomInfoPath } from './file-loader.js';

type backupData = {
    [key: string]: GuildInfoBackup;
};

async function backupServerSettings(guildId: Snowflake): Promise<void> {
    const backups = new Collection<string, GuildInfoBackup>();

    allServerData.forEach((value, key) => {
        backups.set(key, value.toJSON());
    });

    const json = JSON.stringify(backups.toJSON(), null, '\t');
    const backupFile = path.join(_src_dirname, backupServerSettingsPath);

    // create file if it doesn't exist already
    fs.writeFile(backupFile, json, { flag: 'w', encoding: 'utf8' }, err => {
        if (err) {
            console.error(err);
        }
    });
}

async function restoreServerSettings(): Promise<void> {
    console.log('Restoring server settings...');

    const backupFile = path.join(_src_dirname, backupServerSettingsPath);

    if (!fs.existsSync(backupFile)) {
        return;
    }

    try {
        let readPromise = await fs.promises.readFile(backupFile, { encoding: 'utf8' });

        const backup: backupData = JSON.parse(readPromise);

        await Promise.all(
            Object.keys(backup).map(async key => {
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
                    console.log(
                        server.getDisplayMessages().length +
                            ' display messages restored for ' +
                            server.guild.name
                    );
                    console.log(
                        server.getControlPanelMessages().length +
                            ' control panel messages restored for ' +
                            server.guild.name
                    );
                    console.log('Restored server settings for ' + server.guild.name);
                }
            })
        );
    } catch (err) {
        console.error(err);
    }
}

async function backupRoomInfo(): Promise<void> {
    const backupFile = path.join(_src_dirname, backupRoomInfoPath);
    const json = JSON.stringify(roomInfo.toJSON(), null, '\t');

    // create file if it doesn't exist already
    fs.writeFile(backupFile, json, { flag: 'w', encoding: 'utf8' }, err => {
        if (err) {
            console.error(err);
        }
    });
}

async function restoreRoomInfo(): Promise<void> {
    console.log('Restoring room info...');

    const backupFile = path.join(_src_dirname, backupRoomInfoPath);

    if (!fs.existsSync(backupFile)) {
        return;
    }

    try {
        let data = await fs.promises.readFile(backupFile, { encoding: 'utf8' });

        const backup = JSON.parse(data);
        RoomInfo.fromJSON(backup);
    } catch (err) {
        console.error(err);
    }

    console.log('Room info restored.');
}

export { backupServerSettings, restoreServerSettings, backupRoomInfo, restoreRoomInfo };
