import * as vscode from 'vscode'
import {
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
} from 'vscode-languageclient/node'
import { findExecutable } from './find-executable.js'

export async function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('dprint')

  const executablePath = await findExecutable()
  outputChannel.appendLine(`[INFO] Using executable: ${executablePath}`)
  const serverOptions: ServerOptions = {
    run: {
      command: executablePath,
      args: ['lsp'],
    },
    debug: {
      command: executablePath,
      args: ['lsp', '--verbose'],
    },
  }

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      {
        scheme: 'file',
        pattern: '**/*.{ts,js,tsx,jsx,cts,cjs,ctsx,cjsx,mts,mjs,mtsx,mjsx}',
      },
      { scheme: 'file', pattern: '**/*.{json,jsonc}' },
      { scheme: 'file', pattern: '**/*.{yaml,yml}' },
      { scheme: 'file', pattern: '**/*.{css,scss,sass,less}' },
      { scheme: 'file', pattern: '**/*.{html,svelte,vue,astro,jinja,jinja2,nunjucks,twig,vento}' },
      { scheme: 'file', pattern: '**/*.{md,markdown}' },
      { scheme: 'file', pattern: '**/*.graphql' },
      { scheme: 'file', pattern: '**/*.toml' },
      ...vscode.workspace.getConfiguration('dprint').get<string[]>('additionalFilePatterns', [])
        .map((pattern) => ({ scheme: 'file', pattern })),
    ],
    outputChannel,
  }
  const client = new LanguageClient('dprint', serverOptions, clientOptions)
  client.start()

  context.subscriptions.push(client)
  context.subscriptions.push(outputChannel)
}

export function deactivate() {}
