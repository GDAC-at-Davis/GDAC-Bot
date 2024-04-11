import bot_creds_dev from '../creds/bot_creds_dev.json' assert { type: 'json' };
import bot_creds_prod from '../creds/bot_creds_prod.json' assert { type: 'json' };

import path from 'path';

export const prodMode = process.env.NODE_ENV === 'prod';

export const botCreds = prodMode === true ? bot_creds_prod : bot_creds_dev;

// Use the same backup for convenience
export const backupRoomInfoPath: string = path.join(
    '../../backups',
    prodMode === true ? 'room_info.json' : 'room_info.json'
);

export const backupServerSettingsPath: string = path.join(
    '../../backups',
    prodMode === true ? 'server_settings.json' : 'server_settings.json'
);
