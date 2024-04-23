import { GuildMember } from 'discord.js';
import { allServerData, calendarInfo } from '../client.js';
import { LabStatusEmbed } from '../embeds/lab-status-embed.js';
import { ControlPanelEmbed } from '../embeds/control-panel-embed.js';
import { backupRoomInfo } from '../backup.js';
import { z } from 'zod';

// singleton
// handles the room name and the room display
class RoomInfo {
    private roomName: string | null;
    private isRoomOpen: boolean;
    static instance: RoomInfo;

    private constructor(roomName?: string | null) {
        this.roomName = roomName ?? null;
        this.isRoomOpen = false;
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

    public getIsRoomOpen(): boolean {
        return this.isRoomOpen;
    }

    public async setIsRoomOpen(isOpen: boolean): Promise<void> {
        this.isRoomOpen = isOpen;
        backupRoomInfo();
        this.updateDisplays();
    }

    public async updateDisplays(): Promise<void> {
        const officerList = allServerData
            .map(server => {
                return server.getOfficersInRoom();
            })
            .reduce((acc, val) => acc.concat(val), []);

        await Promise.all(
            allServerData.map(async server => {
                server.getDisplayMessages().forEach(async message => {
                    await message.edit(
                        LabStatusEmbed(officerList, calendarInfo.getCurrentEvents(), this)
                    );
                });
            })
        );
        await Promise.all(
            allServerData.map(async server => {
                server.getControlPanelMessages().forEach(async message => {
                    await message.edit(
                        ControlPanelEmbed(
                            officerList,
                            this.roomName ?? '‼️Room Name Not Set‼️'
                        )
                    );
                });
            })
        );
    }

    public toJSON(): RoomInfoBackup {
        return {
            roomName: this.roomName,
            isRoomOpen: this.isRoomOpen
        };
    }

    public static fromJSON(data: any): void {
        const unpack = roomInfoDataSchema.safeParse(data);

        if (!unpack.success) {
            console.error(unpack.error.errors);
            return;
        }

        this.instance.roomName = unpack.data.roomName;
        this.instance.isRoomOpen = unpack.data.isRoomOpen ?? false;
    }
}

type RoomInfoBackup = {
    roomName: string | null;
    isRoomOpen: boolean | null;
};

/**
 * Validation schema for room-info data
 */
const roomInfoDataSchema = z.object({
    roomName: z.string().nullable(),
    isRoomOpen: z.boolean().nullable()
});

export { RoomInfo };
