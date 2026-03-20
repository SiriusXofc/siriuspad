[![Licença: MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-yellow.svg)](./LICENSE)
[![Versão](https://img.shields.io/github/v/release/Nic85796/siriuspad)](https://github.com/Nic85796/siriuspad/releases/latest)
[![Issues](https://img.shields.io/github/issues/Nic85796/siriuspad)](https://github.com/Nic85796/siriuspad/issues)
[![Stars](https://img.shields.io/github/stars/Nic85796/siriuspad)](https://github.com/Nic85796/siriuspad/stargazers)

# SiriusPad

Bloco de notas desktop para desenvolvedores. Local, rápido, escuro e feito para anotações técnicas do dia a dia.

Projeto público mantido por **SiriusX**.

![Screenshot do SiriusPad](./docs/screenshot.svg)

## Visão geral

O SiriusPad é um app desktop open source para guardar:

- bugs
- ideias
- snippets
- comandos
- checklists técnicos
- rascunhos rápidos de arquitetura

Ele foi pensado para ficar perto do fluxo de desenvolvimento sem tentar virar IDE, wiki corporativa ou base de conhecimento engessada.

As notas ficam no seu computador como arquivos Markdown. O uso principal do app é local, sem conta e sem obrigar sincronização externa.

## O que o app entrega hoje

- editor Markdown com CodeMirror 6
- workspaces para separar contexto por projeto, cliente ou tema
- tags, prioridade, cor da nota e notas fixadas
- terminal embutido ligado à pasta da nota ativa
- preview de Markdown e split view
- histórico de versões por nota
- busca fuzzy em títulos e conteúdo
- autosave automático no disco
- exportação para GitHub Gist, `.md`, `.txt` e `.json`
- paleta de comandos com `Ctrl+K`
- atalhos de zoom da interface com `Ctrl++`, `Ctrl+-` e `Ctrl+0`

## Privacidade e segurança

- As notas ficam salvas localmente no seu disco.
- O terminal e o runner executam comandos na sua máquina. Revise antes de rodar.
- O token do GitHub para Gist é armazenado localmente e só é usado quando você aciona a integração.
- Releases oficiais são publicadas no GitHub do projeto.
- Vulnerabilidades devem ser reportadas em privado. Leia [SECURITY.md](./SECURITY.md).

## Distribuição oficial

Formatos suportados atualmente:

- Linux: `.deb`
- Windows: `.exe`

Os assets técnicos de updater, como `latest.json`, continuam existindo apenas para o fluxo de atualização automática.

Releases: https://github.com/Nic85796/siriuspad/releases/latest

## Instalação rápida

Linux:

```bash
bash <(curl -fsSL https://github.com/Nic85796/siriuspad/raw/main/scripts/install-linux.sh) --deb
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-windows.ps1
```

## Atalhos principais

| Atalho | Ação |
|--------|------|
| `Ctrl+N` | Nova nota |
| `Ctrl+K` | Paleta de comandos |
| `Ctrl+F` | Focar busca |
| `Ctrl+S` | Salvar |
| `Ctrl+Enter` | Executar snippet |
| `Ctrl+\`` | Alternar terminal |
| `Ctrl++` | Aumentar zoom da interface |
| `Ctrl+-` | Diminuir zoom da interface |
| `Ctrl+0` | Restaurar zoom da interface |
| `Ctrl+,` | Abrir configurações |

## Projeto público

Se você usa o SiriusPad e quer contribuir, estes arquivos são o melhor ponto de entrada:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [SECURITY.md](./SECURITY.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [NOTICE.md](./NOTICE.md)
- [CHANGELOG.md](./CHANGELOG.md)

## Compilar do fonte

Requisitos:

- Node.js 20+
- Rust stable
- Linux: `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`

```bash
git clone https://github.com/Nic85796/siriuspad
cd siriuspad
npm install
npm run tauri:dev
```

## Suporte e reporte

- bugs: https://github.com/Nic85796/siriuspad/issues
- sugestões: use as issues do repositório
- vulnerabilidades: https://github.com/Nic85796/siriuspad/security/advisories/new

## Licença

MIT — veja [LICENSE](./LICENSE)
