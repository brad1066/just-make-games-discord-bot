import { REST, Routes } from 'discord.js'
import _commands from './index.js'
import dotenv from 'dotenv'

dotenv.config()

const token = process.env.DISCORD_TOKEN
const clientId = process.env.DISCORD_CLIENT_ID
const guildId = process.env.DISCORD_GUILD_ID

console.log(token, clientId, guildId)

const commands = []

for (const command of _commands) {
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON())
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token)
// and deploy your commands!
;(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    )

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    )
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
})()
