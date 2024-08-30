import * as vscode from 'vscode'
import { commandConfigInit } from './commands/config-init.js'
import { setupLspClient } from './lsp.js'

export async function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('dprint')
  context.subscriptions.push(outputChannel)

  if (
    (await vscode.workspace.findFiles('**/{dprint,.dprint}.{json,jsonc}', '**/node_modules/**', 1))
      .length > 0
  ) {
    const client = await setupLspClient(outputChannel)
    client.start()
    context.subscriptions.push(client)
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('dprint.configInit', commandConfigInit)
  )
}

export function deactivate() {}
