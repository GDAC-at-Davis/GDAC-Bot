import bot_creds_dev from '../creds/bot_creds_dev.json' assert { type: 'json' };
import bot_creds_prod from '../creds/bot_creds_prod.json' assert { type: 'json' };

import path from 'path';

export const prodMode = process.env.NODE_ENV === 'prod';

export const botCreds = prodMode === true ? bot_creds_prod : bot_creds_dev;

// Use the same backup for convenience
export const backupRoomInfoPath: string = path.join(
    '../../backups',
    prodMode === true ? 'room_info_prod.json' : 'room_info_dev.json'
);

export const backupServerSettingsPath: string = path.join(
    '../../backups',
    prodMode === true ? 'server_settings_prod.json' : 'server_settings_dev.json'
);
