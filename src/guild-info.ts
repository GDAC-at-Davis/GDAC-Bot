import { Guild, GuildMember, Message, Snowflake, TextBasedChannel, TextChannel } from 'discord.js';
import { client } from './client.js';
import { backupServerSettings } from './backup.js';
import { DisplayEmbed } from './embeds/display-embed.js';
import { ControlPanelEmbed } from './embeds/control-panel-embed.js';

class GuildInfo {
    public readonly guild: Guild;
    private officerRole: Snowflake | null;
    private roomName: string | null;
    private officersInRoom: GuildMember[] = [];
    private displayMessages: Message[] = [];

    constructor(guild: Guild, officerRole?: Snowflake | null, roomName?: string | null, officersInRoom?: GuildMember[], displayMessages?: Message[]) {
        this.guild = guild;
        this.officerRole = officerRole ?? null;
        this.roomName = roomName ?? null;
        this.officersInRoom = officersInRoom ?? [];
        this.displayMessages = displayMessages ?? [];
    }

    public getOfficerRole(): Snowflake | null {
        return this.officerRole;
    }

    public async setOfficerRole(role: Snowflake | null): Promise<void> {
        this.officerRole = role;
        backupServerSettings(this.guild.id);
        this.updateDisplays();
    }

    public getRoomName(): string | null {
        return this.roomName;
    }

    public async setRoomName(name: string | null): Promise<void> {
        this.roomName = name;
        backupServerSettings(this.guild.id);
        this.updateDisplays();
    }

    public getOfficersInRoom(): GuildMember[] {
        return this.officersInRoom;
    }

    public async addOfficerToRoom(member: GuildMember): Promise<boolean> {
        if (this.officersInRoom.some(officer => officer.id === member.id)) {
            return false;
        }
        this.officersInRoom.push(member);
        backupServerSettings(this.guild.id);
        this.updateDisplays();
        return true;
    }

    public async removeOfficerFromRoom(member: GuildMember): Promise<boolean> {
        if (this.officersInRoom.some(officer => officer.id === member.id)) {
            this.officersInRoom = this.officersInRoom.filter(officer => officer.id !== member.id);
            backupServerSettings(this.guild.id);
            this.updateDisplays();
            return true;
        }
        return false;
    }

    public async createNewDisplay(channel: TextBasedChannel): Promise<void> {
        const embed = DisplayEmbed(this.officersInRoom, this.roomName ?? '‼️Room Name Not Set‼️');
        const message = await channel?.send(embed);
        this.displayMessages.push(message as Message);
        backupServerSettings(this.guild.id);
    }

    private async updateDisplays(): Promise<void> {
        await Promise.all(this.displayMessages.map(async message => {
            const embed = DisplayEmbed(this.officersInRoom, this.roomName ?? '‼️Room Name Not Set‼️');
            await message.edit(embed);
        }));
    }

    public removeDisplay(message: Message): void {
        if (this.displayMessages.some(display => display.id === message.id)) {
            this.displayMessages = this.displayMessages.filter(display => display.id !== message.id);
            backupServerSettings(this.guild.id);
        }
    }

    public async createControlPanel(channel: TextBasedChannel): Promise<void> {
        channel.send(ControlPanelEmbed(this.officersInRoom, this.roomName ?? '‼️Room Name Not Set‼️'))
}

    public toJSON(): GuildInfoBackup {
        return {
            guildId: this.guild.id,
            officerRole: this.officerRole,
            roomName: this.roomName,
            officersInRoom: this.officersInRoom.map(officer => officer.id),
            displayMessages: this.displayMessages.map(display => display.id)
        };
    }

    public static async fromJSON(data: GuildInfoBackup): Promise<GuildInfo> {
        const guildId = data.guildId;
        const guild = await client.guilds.fetch(guildId);
        const officersInRoom = await Promise.all(data.officersInRoom.map(async officerId => {
            return await guild.members.fetch(officerId);
        }));
        const displayMessages: Message[] = [];
        const channels = await guild.channels.fetch();
        channels.map(async channel => {
            if (channel instanceof TextChannel) {
                const messages = await channel.messages.fetch();
                data.displayMessages.forEach(displayId => {
                    const message = messages.get(displayId);
                    if (message !== undefined) {
                        displayMessages.push(message);
                    }
                });
            }
        });
        const server = new GuildInfo(guild, data.officerRole, data.roomName, officersInRoom, displayMessages);
        return server;
    }
}

type GuildInfoBackup = {
    guildId: Snowflake;
    officerRole: Snowflake | null;
    roomName: string | null;
    officersInRoom: Snowflake[];
    displayMessages: Snowflake[];
};

export { GuildInfo, GuildInfoBackup };
