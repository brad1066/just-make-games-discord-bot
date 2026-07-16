import dotenv from 'dotenv'
import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ModalBuilder,
  TextDisplayBuilder,
  LabelBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags
} from 'discord.js'
import sqlite3 from 'sqlite3'
import { checkUserExists, registerUser } from './db/actions.js'
import commands from './commands/index.js'
import register from './commands/utility/register.js'
import unregister from './commands/utility/unregister.js'

dotenv.config()

const db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.error('Error opening database:', err.message)
})

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

client.commands = new Collection()
commands.forEach((command) => {
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command)
  }
})

client.login(process.env.DISCORD_TOKEN)

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.once(Events.MessageCreate, async (message) => {
  if (message?.author.bot) return // Ignore messages from bots

  console.log(
    `Received message: ${message.content} from ${message.author.tag} in channel ${message.channel.id}`
  )
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return
  const command = interaction.client.commands.get(interaction.commandName)
  try {
    switch (interaction.commandName) {
      case 'register':
        if (!(await checkUserExists(db, interaction.user.username)).length)
          return await interaction.showModal(getRegisterModal())
        return await interaction.reply({
          content: 'You are already registered',
          flags: MessageFlags.Ephemeral
        })
        break
      case 'unregister':
        if ((await checkUserExists(db, interaction.user.username)).length)
          return await interaction.showModal(getUnregisterModal())
        return await interaction.reply({
          content: 'You aren\t registered',
          flags: MessageFlags.Ephemeral
        })
        break
      default:
        await command.execute(interaction)
    }
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral
      })
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        flags: MessageFlags.Ephemeral
      })
    }
  }
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return

  let response;

  switch (interaction.customId) {
    case 'registerModal':
      response = interaction.fields.getTextInputValue(
        'confirmation'
      )
      if (response === 'REGISTER') {
        return await register.execute(interaction)
      }
      return interaction.reply({
        content: 'You have not been registered',
        flags: MessageFlags.Ephemeral
      })
      break
    case 'unregisterModal':
      response = interaction.fields.getTextInputValue(
        'confirmation'
      )
      if (response === 'UNREGISTER') {
        return await unregister.execute(interaction)
      }
      return interaction.reply({
        content: 'You have not been unregistered',
        flags: MessageFlags.Ephemeral
      })
      break
    default:
      break
  }
})

const getRegisterModal = () => {
  const detailsText = new TextDisplayBuilder().setContent(
    'If you register for the recognition system, we will store the following information:\n' +
      '- Your Discord username\n' +
      '- When you registered\n' +
      '- How many points you have accrued\n' +
      'We will also store (separately and anonymously), a weekly breakdown of your point increases for shoutouts and recognition'
  )

  const confirmationInput = new TextInputBuilder()
    .setCustomId('confirmation')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('REGISTER')
    .setRequired(true)

  const confirmationText = new LabelBuilder()
    .setId(1)
    .setLabel("Please enter 'REGISTER' to continue")
    .setTextInputComponent(confirmationInput)

  return new ModalBuilder()
    .setCustomId('registerModal')
    .setTitle('Register for recognition')
    .addTextDisplayComponents(detailsText)
    .addLabelComponents(confirmationText)
}

const getUnregisterModal = () => {
  const detailsText = new TextDisplayBuilder().setContent(
    'If you unregister for the recognition system, we will delete all information stored about you:\n' +
      '- Your Discord username\n' +
      '- When you registered\n' +
      '- How many points you have accrued\n' +
      'We will continue to store the anonymised point weekly breakdown. This data will not be retrievable'
  )

  const confirmationInput = new TextInputBuilder()
    .setCustomId('confirmation')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('UNREGISTER')
    .setRequired(true)

  const confirmationText = new LabelBuilder()
    .setId(1)
    .setLabel("Please enter 'UNREGISTER' to continue")
    .setTextInputComponent(confirmationInput)

  return new ModalBuilder()
    .setCustomId('unregisterModal')
    .setTitle('Unregister for recognition')
    .addTextDisplayComponents(detailsText)
    .addLabelComponents(confirmationText)
}
