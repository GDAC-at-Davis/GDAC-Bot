import { Events, GuildMember, Message } from 'discord.js';

import { handleButton } from './button-handler.js';
import { allServerData, calendarInfo, client, roomInfo } from './client.js';

import { botCreds, prodMode } from './file-loader.js';
import { restoreRoomInfo, restoreServerSettings } from './backup.js';
import { GuildInfo } from './info/guild-info.js';

import { startWebServer } from './web-api.js';

client.on(Events.ClientReady, async () => {
    console.log(`\nBot is ready! Booting in ${prodMode ? 'Production' : 'Dev'} mode.\n`);

    await calendarInfo
        .checkCalendarConnection(botCreds.googleCalendarID)
        .then(console.log)
        .catch(console.error);

    await restoreServerSettings();

    await restoreRoomInfo();

    client.deployCommands(botCreds.restrictedGuildIDs);

    await roomInfo.updateDisplays();

    await calendarInfo.initCalendarRefreshTimer();

    startWebServer(botCreds.webServerPort);
});

client.on(Events.GuildMemberRemove, async member => {
    var guildMember: GuildMember;
    if (member.partial) {
        guildMember = await member.fetch();
    } else {
        guildMember = member;
    }
    const server = allServerData.get(guildMember.guild.id);
    if (server === undefined) {
        return;
    }
    server.removeOfficerFromRoom(guildMember);
});

client.on(Events.GuildRoleDelete, async role => {
    allServerData.forEach(server => {
        if (server.getOfficerRole() === role.id) {
            server.setOfficerRole(null);
        }
    });
});

client.on(Events.MessageCreate, async message => {});

client.on(Events.MessageDelete, async message => {
    var guildMessage: Message;

    if (message.author != null && message.author.id !== client.user?.id) {
        return;
    }

    if (message.partial) {
        try {
            guildMessage = await message.fetch();
        } catch (error) {
            console.error(error);
            return;
        }
    } else {
        guildMessage = message;
    }
    const server = allServerData.get(guildMessage.guild?.id ?? '');
    if (server === undefined) {
        return;
    }
    server.removeDisplay(guildMessage);
    server.removeControlPanel(guildMessage);
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        handleButton(interaction);
    }
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            });
        }
    }
});

client.on(Events.GuildCreate, guild => {
    allServerData.set(guild.id, new GuildInfo(guild));
});

client.on(Events.GuildDelete, guild => {
    allServerData.delete(guild.id);
});

client
    .login(botCreds['discord-app-bot-token'])
    .then(() => {
        console.log(`Logged in as ${client.user.username}!`);
    })
    .catch((err: Error) => {
        console.error('Login Unsuccessful. Check credentials.');
        throw err;
    });
