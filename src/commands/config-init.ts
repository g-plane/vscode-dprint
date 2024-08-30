import * as vscode from 'vscode'

export async function commandConfigInit(): Promise<boolean> {
  const workspace = await vscode.window.showWorkspaceFolderPick()
  if (!workspace) {
    return false
  }

  const configFiles = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspace, '{dprint,.dprint}.{json,jsonc}'),
    '**/node_modules/**',
    1
  )
  if (configFiles.length > 0) {
    vscode.window.showInformationMessage(
      'There is already a dprint configuration file in this workspace.'
    )
    return false
  }

  const pickedPlugins = await vscode.window.showQuickPick<PickItem>(
    fetchPlugins().then((plugins) =>
      plugins.map<PickItem>((plugin) => {
        const patterns = plugin.fileExtensions.map((ext) => `*.${ext}`).join(', ')
        return {
          plugin,
          label: plugin.name,
          picked: plugin.selected,
          detail: `For ${patterns} files.`,
        }
      })
    ),
    {
      title: 'Create dprint Configuration File',
      placeHolder: 'Select plugins',
      canPickMany: true,
      matchOnDetail: true,
    }
  )

  if (!pickedPlugins || pickedPlugins.length === 0) {
    return false
  }
  const pluginURLs: string[] = []
  const config = pickedPlugins.reduce<Record<string, {}>>(
    (acc, { plugin }) => {
      acc[plugin.configKey] = {}
      pluginURLs.push(plugin.url)
      return acc
    },
    {}
  )
  await vscode.workspace.fs.writeFile(
    vscode.Uri.joinPath(
      workspace.uri,
      vscode.workspace.getConfiguration('dprint').get<string>('newConfigFileName', 'dprint.json')
    ),
    new TextEncoder().encode(JSON.stringify({ ...config, plugins: pluginURLs }, null, 2) + '\n')
  )

  return true
}

type PickItem = vscode.QuickPickItem & { plugin: Plugin }

async function fetchPlugins(): Promise<Plugin[]> {
  const response = await fetch('https://plugins.dprint.dev/info.json')
  return (await response.json()).latest
}

type Plugin = {
  name: string,
  selected: boolean,
  configKey: string,
  fileExtensions: string[],
  configExcludes: string[],
  url: string,
}
