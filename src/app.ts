import { Events } from 'discord.js';

import { handleButton } from './button-handler.js';
import { client } from './client.js';

import bot_creds from '../bot_creds.json' assert { type: 'json' };

client.on(Events.ClientReady, async () => {
    console.log('\nBot is ready!');

    client.deployCommands();
});

client.on(Events.MessageCreate, async message => {});

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

client.on(Events.GuildCreate, guild => {});

client.on(Events.GuildDelete, guild => {});

client
    .login(bot_creds.token)
    .then(() => {
        console.log(`Logged in as ${client.user.username}!`);
    })
    .catch((err: Error) => {
        console.error('Login Unsuccessful. Check credentials.');
        throw err;
    });
