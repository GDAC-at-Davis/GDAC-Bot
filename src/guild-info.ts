import {
    Guild,
    GuildMember,
    Message,
    Snowflake,
    TextBasedChannel,
    TextChannel
} from 'discord.js';
import { client, roomInfo } from './client.js';
import { backupServerSettings } from './backup.js';
import { DisplayEmbed } from './embeds/display-embed.js';
import { ControlPanelEmbed } from './embeds/control-panel-embed.js';

class GuildInfo {
    public readonly guild: Guild;
    private officerRole: Snowflake | null;
    private officersInRoom: GuildMember[] = [];
    private displayMessages: Message[] = [];
    private controlPanelMessages: Message[] = [];

    constructor(
        guild: Guild,
        officerRole?: Snowflake | null,
        officersInRoom?: GuildMember[],
        displayMessages?: Message[],
        controlPanelMessages?: Message[]
    ) {
        this.guild = guild;
        this.officerRole = officerRole ?? null;
        this.officersInRoom = officersInRoom ?? [];
        this.displayMessages = displayMessages ?? [];
        this.controlPanelMessages = controlPanelMessages ?? [];
    }

    public getOfficerRole(): Snowflake | null {
        return this.officerRole;
    }

    public async setOfficerRole(role: Snowflake | null): Promise<void> {
        this.officerRole = role;
        backupServerSettings(this.guild.id);
        roomInfo.updateDisplays();
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
        roomInfo.updateDisplays();
        return true;
    }

    public async removeOfficerFromRoom(member: GuildMember): Promise<boolean> {
        if (this.officersInRoom.some(officer => officer.id === member.id)) {
            this.officersInRoom = this.officersInRoom.filter(
                officer => officer.id !== member.id
            );
            backupServerSettings(this.guild.id);
            roomInfo.updateDisplays();
            return true;
        }
        return false;
    }

    public async createNewDisplay(channel: TextBasedChannel): Promise<void> {
        const embed = DisplayEmbed(
            this.officersInRoom,
            roomInfo.getRoomName() ?? '‼️Room Name Not Set‼️'
        );
        const message = await channel?.send(embed);
        this.displayMessages.push(message as Message);
        backupServerSettings(this.guild.id);
    }

    public removeDisplay(message: Message): void {
        if (this.displayMessages.some(display => display.id === message.id)) {
            this.displayMessages = this.displayMessages.filter(
                display => display.id !== message.id
            );
            backupServerSettings(this.guild.id);
        }
    }

    public getDisplayMessages(): Message[] {
        return this.displayMessages;
    }

    public async createControlPanel(channel: TextBasedChannel): Promise<void> {
        channel.send(
            ControlPanelEmbed(
                this.officersInRoom,
                roomInfo.getRoomName() ?? '‼️Room Name Not Set‼️'
            )
        );
    }

    public async removeControlPanel(message: Message): Promise<void> {
        if (this.displayMessages.some(display => display.id === message.id)) {
            this.displayMessages = this.displayMessages.filter(
                display => display.id !== message.id
            );
            backupServerSettings(this.guild.id);
        }
    }

    public  getControlPanelMessages(): Message[] {
        return this.controlPanelMessages;
    }

    public toJSON(): GuildInfoBackup {
        return {
            guildId: this.guild.id,
            officerRole: this.officerRole,
            officersInRoom: this.officersInRoom.map(officer => officer.id),
            displayMessages: this.displayMessages.map(display => display.id),
            controlPanelMessages: this.controlPanelMessages.map(controlPanel => controlPanel.id)
        };
    }

    public static async fromJSON(data: GuildInfoBackup): Promise<GuildInfo> {
        const guildId = data.guildId;
        const guild = await client.guilds.fetch(guildId);
        const officersInRoom = await Promise.all(
            data.officersInRoom.map(async officerId => {
                return await guild.members.fetch(officerId);
            })
        );
        const displayMessages: Message[] = [];
        const controlPanelMessages: Message[] = [];
        const channels = await guild.channels.fetch();
        channels.map(async channel => {
            if (channel instanceof TextChannel) {
                const messages = await channel.messages.fetch();
                data.displayMessages?.forEach(displayId => {
                    const message = messages.get(displayId);
                    if (message !== undefined) {
                        displayMessages.push(message);
                    }
                });
                data.controlPanelMessages?.forEach(controlPanelId => {
                    const message = messages.get(controlPanelId);
                    if (message !== undefined) {
                        controlPanelMessages.push(message);
                    }
                });
            }
        });
        const server = new GuildInfo(
            guild,
            data.officerRole,
            officersInRoom,
            displayMessages
        );
        return server;
    }
}

type GuildInfoBackup = {
    guildId: Snowflake;
    officerRole: Snowflake | null;
    officersInRoom: Snowflake[];
    displayMessages: Snowflake[];
    controlPanelMessages: Snowflake[];
};

export { GuildInfo, GuildInfoBackup };
