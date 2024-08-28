import * as vscode from 'vscode'
import { setupLspClient } from './lsp.js'

export async function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('dprint')
  context.subscriptions.push(outputChannel)

  const client = await setupLspClient(outputChannel)
  client.start()
  context.subscriptions.push(client)
}

export function deactivate() {}
