import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import sqlite3 from 'sqlite3'
import { checkUserExists, unregisterUser } from '../../db/actions.js'

const db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error('Error opening database:', err.message)
})

export default {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Unregister from recognition points'),
  async execute(interaction) {

    const foundUser = await checkUserExists(db, interaction?.user?.username)
    if (foundUser.length === 0) {
        return await interaction.reply({
            content: "You aren't registered",
            flags: MessageFlags.Ephemeral
        })
    }

    const unregistered = await unregisterUser(db, interaction?.user?.username)

    await interaction.reply({
      content: "You have been unregistered, and all your data destroyed",
      flags: MessageFlags.Ephemeral
    })
  }
}
