import { Guild, Snowflake } from 'discord.js';
import { client } from './client.js';
import { backupServerSettings } from './backup.js';

class GuildInfo {
    public readonly guild: Guild;
    private officerRole: Snowflake | null;
    private roomName: string | null;

    constructor(guild: Guild) {
        this.guild = guild;
        this.officerRole = null;
        this.roomName = null;
    }

    public getOfficerRole(): Snowflake | null {
        return this.officerRole;
    }

    public setOfficerRole(role: Snowflake | null): void {
        this.officerRole = role;
        backupServerSettings(this.guild.id);
    }

    public getRoomName(): string | null {
        return this.roomName;
    }

    public setRoomName(name: string | null): void {
        this.roomName = name;
        backupServerSettings(this.guild.id);
    }

    public toJSON(): GuildInfoBackup {
        return {
            guildId: this.guild.id,
            officerRole: this.officerRole,
            roomName: this.roomName
        };
    }

    public static async fromJSON(data: GuildInfoBackup): Promise<GuildInfo> {
        const guildId = data.guildId;
        const guild = await client.guilds.fetch(guildId);
        const server = new GuildInfo(guild);
        server.setOfficerRole(data.officerRole);
        server.setRoomName(data.roomName);
        return server;
    }
}

type GuildInfoBackup = {
    guildId: Snowflake;
    officerRole: Snowflake | null;
    roomName: string | null;
};

export { GuildInfo, GuildInfoBackup };
