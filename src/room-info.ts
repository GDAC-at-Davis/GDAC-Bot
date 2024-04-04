import { GuildMember } from "discord.js";
import { allServerData } from "./client.js";
import { DisplayEmbed } from "./embeds/display-embed.js";
import { ControlPanelEmbed } from "./embeds/control-panel-embed.js";
import { backupRoomInfo } from "./backup.js";

// singleton
class RoomInfo {
    private roomName: string | null;
    static instance: RoomInfo;

    private constructor(
        roomName?: string | null,
    ) {
        this.roomName = roomName ?? null;
    }

    public static getInstance(): RoomInfo {
        if (!RoomInfo.instance) {
            RoomInfo.instance = new RoomInfo();
        }
        return RoomInfo.instance;
    }

    public getRoomName(): string | null {
        return this.roomName;
    }

    public async setRoomName(name: string | null): Promise<void> {
        this.roomName = name;
        backupRoomInfo();
        this.updateDisplays();
    }

    public async updateDisplays(): Promise<void> {
        const officerList = allServerData.map(server => {
            return server.getOfficersInRoom();
        })
        .reduce((acc, val) => acc.concat(val), []);

        await Promise.all(
            allServerData.map(async server => {
                server.getDisplayMessages().forEach(async message => {
                    await message.edit(DisplayEmbed(officerList, this.roomName ?? "‼️Room Name Not Set‼️"));
                });
            })
        );
        await Promise.all(
            allServerData.map(async server => {
                server.getControlPanelMessages().forEach(async message => {
                    await message.edit(ControlPanelEmbed(officerList, this.roomName ?? "‼️Room Name Not Set‼️"));
                });
            })
        );
    }

    public toJSON(): RoomInfoBackup {
        return {
            roomName: this.roomName
        };
    }

    public static fromJSON(data: RoomInfoBackup): void {
        this.instance = new RoomInfo(data.roomName);
    }
}

type RoomInfoBackup = {
    roomName: string | null;
}

export { RoomInfo };