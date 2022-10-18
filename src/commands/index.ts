import { App } from '@slack/bolt'
import { tareaSlashCommand } from './tarea'

export const configureAppCommands = (app: App) => {
  tareaSlashCommand(app)
}