import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import sqlite3 from 'sqlite3'
import { checkUserExists, registerUser } from '../../db/actions.js'

const db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error('Error opening database:', err.message)
})

export default {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register for recognition points'),
  async execute(interaction) {
    const foundUser = await checkUserExists(db, interaction?.user?.username)
    if (foundUser.length !== 0) {
      return await interaction.reply({
        content: 'You are already registered',
        flags: MessageFlags.Ephemeral
      })
    }
    await registerUser(db, interaction?.user?.username);

    await interaction.reply({
      content: "You have been registered",
      flags: MessageFlags.Ephemeral
    })
  }
}
