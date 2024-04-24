import { GuildMember } from 'discord.js';
import { allServerData, calendarInfo } from '../client.js';
import { LabStatusEmbed } from '../embeds/lab-status-embed.js';
import { ControlPanelEmbed } from '../embeds/control-panel-embed.js';
import { backupRoomInfo } from '../backup.js';
import { z } from 'zod';

enum RoomOpenState {
    No = 0,
    Yes = 1,
    OfficerDependent = 2
}

// singleton
// handles the room name and the room display
class RoomInfo {
    private roomName: string | null;

    // 0 is closed, 1 is open, 2 is dependent on officer presence
    private roomOpenState: number;
    static instance: RoomInfo;

    private constructor(roomName?: string | null) {
        this.roomName = roomName ?? null;
        this.roomOpenState = RoomOpenState.No;
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

    public getroomOpenState(): RoomOpenState {
        return this.roomOpenState;
    }

    public async setroomOpenState(isOpen: number): Promise<void> {
        if (isOpen < 0 || isOpen > 2) {
            return;
        }
        this.roomOpenState = isOpen;
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
            roomOpenState: this.roomOpenState
        };
    }

    public static fromJSON(data: any): void {
        const unpack = roomInfoDataSchema.safeParse(data);

        if (!unpack.success) {
            console.error(unpack.error.errors);
            return;
        }

        this.instance.roomName = unpack.data.roomName;
        this.instance.roomOpenState = unpack.data.roomOpenState ?? RoomOpenState.No;
    }
}

type RoomInfoBackup = {
    roomName: string | null;
    roomOpenState: RoomOpenState | null;
};

/**
 * Validation schema for room-info data
 */
const roomInfoDataSchema = z.object({
    roomName: z.string().nullable(),
    roomOpenState: z.number().nullable()
});

export { RoomInfo, RoomOpenState };
