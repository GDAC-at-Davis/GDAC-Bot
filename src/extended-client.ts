import { Client, Collection, REST, Routes } from 'discord.js';
import path from 'path';
import { commandData } from './utilities.js';
import fs from 'node:fs';
import { _src_dirname } from './client.js';

class extendedClient extends Client<true> {
    public commands: Collection<string, commandData>;
    public constructor(client: Client) {
        super(client.options);
        this.commands = new Collection();
    }
    public async deployCommands() {
        const commands = [];

        const commandsPath = path.join(_src_dirname, './commands');
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = (await import(filePath)).default as commandData;
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if (command !== undefined && command !== null) {
                this.commands.set(command.data.name, command);
            } else {
                console.log(
                    `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                );
            }
            commands.push(command.data.toJSON());
        }

        // Construct and prepare an instance of the REST module
        const rest = new REST({ version: '10' }).setToken(this.token);

        // and deploy your commands!
        (async () => {
            try {
                console.log(
                    `Started refreshing ${commands.length} application (/) commands.`
                );

                // The put method is used to fully refresh all commands in the guild with the current set
                await rest.put(Routes.applicationCommands(this.user.id), {
                    body: commands
                });

                console.log(`Successfully reloaded application (/) commands.`);
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        })();
    }
}

export { extendedClient };
