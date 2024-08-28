import * as os from 'node:os'
import * as vscode from 'vscode'

export async function findExecutable() {
  const [binFromNode] = await vscode.workspace.findFiles(
    '**/node_modules/dprint/{dprint,dprint.exe}',
    null,
    1
  )
  if (binFromNode) {
    return binFromNode.fsPath
  }

  const configuration = vscode.workspace.getConfiguration('dprint')
  return os.platform() === 'win32'
    ? (configuration.get<string>('executablePath.win') || 'dprint.exe')
    : (configuration.get<string>('executablePath.unix') || 'dprint')
}
