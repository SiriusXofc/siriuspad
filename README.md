[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-yellow.svg)](./LICENSE)
[![Versão](https://img.shields.io/github/v/release/Nic85796/siriuspad)](https://github.com/Nic85796/siriuspad/releases/latest)
[![Issues](https://img.shields.io/github/issues/Nic85796/siriuspad)](https://github.com/Nic85796/siriuspad/issues)
[![Stars](https://img.shields.io/github/stars/Nic85796/siriuspad)](https://github.com/Nic85796/siriuspad/stargazers)

# SiriusPad

Bloco de notas para desenvolvedores. Rápido, escuro e local.

![Screenshot do SiriusPad](./docs/screenshot.svg)

## O que é

O SiriusPad é um app desktop open source para notas técnicas, snippets, comandos e rascunhos de arquitetura. Ele foi feito para abrir rápido e ficar no caminho do seu fluxo, não na frente dele.

É um espaço para desenvolvedores que precisam registrar coisas curtas e úteis no meio do trabalho: um comando que você sempre esquece, um log de bug, uma ideia de refactor ou um snippet para testar.

Não é VSCode, não é Notion e não é Obsidian. As notas ficam salvas como arquivos `.md` no seu computador, sem conta, sem nuvem e sem prender seus dados ao app.

## Funcionalidades

- Editor markdown com syntax highlight usando CodeMirror 6
- Espaços de trabalho para separar notas por projeto ou contexto
- Tags, notas fixadas e ordenação por atualização
- Busca fuzzy em títulos e conteúdo
- Autosave automático no disco
- Snippet runner direto na nota para Python, JavaScript, Bash, Go, Ruby e mais
- Variáveis globais injetadas no runner e ao copiar conteúdo com `{{NOME}}`
- Export para GitHub Gist
- Command palette com `Ctrl+K`

## Em desenvolvimento

> ⚠️ As funcionalidades abaixo estão em desenvolvimento ativo. Podem ter bugs ou mudar antes do lançamento estável mais maduro.

- 🌍 Multi-idioma em Português, Inglês e Espanhol
- 🖥️ Tela cheia, Focus Mode e Zen Mode
- 📑 Abas para várias notas abertas ao mesmo tempo
- 👁️ Preview de Markdown em split view
- 📜 Histórico de versões por nota
- 🔍 Find & Replace no editor com `Ctrl+H`
- 🎨 Temas extras além do dark padrão
- 🍎 Release para macOS com `.dmg` universal
- 📤 Exportação como `.md`, `.txt` e `.json`

## Atalhos

| Atalho | Ação |
|--------|------|
| `Ctrl+N` | Nova nota |
| `Ctrl+K` | Command palette |
| `Ctrl+F` | Focar busca |
| `Ctrl+S` | Salvar |
| `Ctrl+Enter` | Executar snippet |
| `Ctrl+W` | Fechar nota |
| `Ctrl+,` | Configurações |
| `Ctrl+D` | Duplicar nota |
| `Ctrl+Shift+C` | Copiar com variáveis |
| `Ctrl+Shift+G` | Exportar para Gist |
| `Ctrl+Shift+P` | Fixar / desafixar nota |
| `Alt+1..9` | Trocar de espaço de trabalho |

## Instalação

| Sistema | Formato | Link |
|---------|---------|------|
| Linux | `.deb` | [Releases](https://github.com/Nic85796/siriuspad/releases/latest) |
| Linux | `.AppImage` | [Releases](https://github.com/Nic85796/siriuspad/releases/latest) |
| Windows | `.msi` | [Releases](https://github.com/Nic85796/siriuspad/releases/latest) |
| Windows | `.exe` | [Releases](https://github.com/Nic85796/siriuspad/releases/latest) |
| macOS | `.dmg` | [Releases](https://github.com/Nic85796/siriuspad/releases/latest) |

Script para Linux:

```bash
bash <(curl -fsSL https://github.com/Nic85796/siriuspad/raw/main/scripts/install-linux.sh) --deb
```

Script para Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-windows.ps1 -Format msi
```

## Compilar do fonte

Requisitos: Node.js 20+, Rust stable e, no Linux, `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`.

```bash
git clone https://github.com/Nic85796/siriuspad
cd siriuspad
npm install
npm run tauri:dev
```

## Contribuindo

Issues e PRs são bem-vindos. Se a mudança for grande, abra uma issue antes para alinharmos a direção e evitar retrabalho.

Se você quiser mexer em runner, editor, i18n ou workflow de release, vale olhar também o [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licença

MIT — veja [LICENSE](./LICENSE)
