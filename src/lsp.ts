import * as vscode from 'vscode'
import {
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
} from 'vscode-languageclient/node'
import { findExecutable } from './find-executable.js'

export async function setupLspClient(outputChannel: vscode.OutputChannel) {
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
  return new LanguageClient('dprint', serverOptions, clientOptions)
}
