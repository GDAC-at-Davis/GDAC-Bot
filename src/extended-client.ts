import { Client, Collection, Guild, REST, Routes, Snowflake } from 'discord.js';
import path from 'path';
import { CommandData, CommandType } from './utilities.js';
import fs from 'node:fs';
import { _src_dirname } from './client.js';
import { pathToFileURL } from 'url';

class extendedClient extends Client<true> {
    public commands: Collection<string, commandData>;
    public constructor(client: Client) {
        super(client.options);
        this.commands = new Collection();
    }
    public async deployCommands(restrictedGuildIDs: Snowflake[]) {
        const globalCommands = [];
        const restrictedCommands = [];

        // get all js command files
        const commandsPath = path.join(_src_dirname, './commands');
        const commandFiles = fs
            .readdirSync(commandsPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);

            const fileUrl = pathToFileURL(filePath).toString();

            const command = (await import(fileUrl)).default as commandData;

            console.log(`Loaded command ${command.data.name} at ${fileUrl}`);
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if (command !== undefined && command !== null) {
                this.commands.set(command.data.name, command);
            } else {
                console.log(
                    `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                );
            }
            if (command.type === CommandType.GLOBAL) {
                globalCommands.push(command.data.toJSON());
            } else {
                restrictedCommands.push(command.data.toJSON());
            }
        }

        // Construct and prepare an instance of the REST module
        const rest = new REST({ version: '10' }).setToken(this.token);

        // and deploy your commands!
        (async () => {
            try {
                console.log(
                    `Started refreshing ${globalCommands.length} application (/) commands.`
                );

                // The put method is used to fully refresh all commands in the guild with the current set
                await rest.put(Routes.applicationCommands(this.user.id), {
                    body: globalCommands
                });

                // for each restricted server push the restricted commands
                for (const guildId of restrictedGuildIDs) {
                    await rest.put(
                        Routes.applicationGuildCommands(this.user.id, guildId),
                        {
                            body: restrictedCommands
                        }
                    );
                }

                console.log(`Successfully reloaded application (/) commands.`);
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        })();
    }
}

export { extendedClient };
