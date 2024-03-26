import { Guild, GuildMember, Snowflake } from 'discord.js';
import { client } from './client.js';
import { backupServerSettings } from './backup.js';

class GuildInfo {
    public readonly guild: Guild;
    private officerRole: Snowflake | null;
    private roomName: string | null;
    private officersInRoom: GuildMember[] = [];

    constructor(guild: Guild, officerRole?: Snowflake | null, roomName?: string | null, officersInRoom?: GuildMember[]) {
        this.guild = guild;
        this.officerRole = officerRole ?? null;
        this.roomName = roomName ?? null;
        this.officersInRoom = officersInRoom ?? [];
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

    public getOfficersInRoom(): GuildMember[] {
        return this.officersInRoom;
    }

    public addOfficerToRoom(member: GuildMember): void {
        this.officersInRoom.push(member);
    }

    public removeOfficerFromRoom(member: GuildMember): void {
        this.officersInRoom = this.officersInRoom.filter(officer => officer.id !== member.id);
    }

    
    public toJSON(): GuildInfoBackup {
        return {
            guildId: this.guild.id,
            officerRole: this.officerRole,
            roomName: this.roomName,
            officersInRoom: this.officersInRoom.map(officer => officer.id)
        };
    }

    public static async fromJSON(data: GuildInfoBackup): Promise<GuildInfo> {
        const guildId = data.guildId;
        const guild = await client.guilds.fetch(guildId);
        const officersInRoom = await Promise.all(data.officersInRoom.map(async officerId => {
            return await guild.members.fetch(officerId);
        }));
        const server = new GuildInfo(guild, data.officerRole, data.roomName, officersInRoom);
        return server;
    }
}

type GuildInfoBackup = {
    guildId: Snowflake;
    officerRole: Snowflake | null;
    roomName: string | null;
    officersInRoom: Snowflake[];
};

export { GuildInfo, GuildInfoBackup };
