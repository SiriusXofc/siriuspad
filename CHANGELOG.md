# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

## [1.0.18] - 2026-03-20

### Fixed

- workflow Android agora localiza o `.apk` com `find` antes de publicar a release
- upload do APK deixou de depender de `**/*.apk` sem `globstar`
- build Android foi validado localmente até gerar `app-universal-debug.apk`

## [1.0.17] - 2026-03-20

### Fixed

- Android deixou de herdar permissões `global-shortcut` do desktop durante o build
- capabilities do Tauri agora são separadas por plataforma, com mobile mais enxuto e compatível
- pipeline Android pode seguir da fase de permissões para a compilação real do APK

## [1.0.16] - 2026-03-20

### Fixed

- workflow de Android agora aceita licenças do SDK sem quebrar no `pipefail`
- instalação dos pacotes Android usa `sdkmanager --sdk_root` para ficar mais estável no GitHub Actions

## [1.0.15] - 2026-03-20

### Added

- beta inicial para Android com APK de teste em release
- header mobile próprio com ações rápidas para notas, busca, ajustes e configurações

### Changed

- layout mobile agora usa sidebar e painel de ajustes como overlays tocáveis, em vez de tentar espremer a interface desktop
- checklist, callouts e edição continuam no fluxo principal da nota mesmo no mobile

### Fixed

- terminal embutido passou a ser tratado como desktop-only para não quebrar a experiência Android
- detecção de plataforma agora diferencia Android e iOS corretamente
- endpoint do updater e metadados do projeto foram alinhados com o repositório público atual

## [1.0.14] - 2026-03-20

### Changed

- aplicativo ganhou animações sutis em painéis, abas, cards, botões e modais para deixar a navegação mais fluida
- sidebar, painel direito e header do editor receberam transições e hover states mais vivos sem perder o visual minimalista
- modal de atualização foi reorganizado para exibir resumo e destaques da release de forma mais limpa

### Fixed

- tela de atualização não quebra mais o layout ao mostrar versões e detalhes da release
- links de release do updater agora apontam para o repositório público atual

## [1.0.13] - 2026-03-20

### Changed

- área central da nota voltou a ficar mais limpa, mantendo checklist, cor e callouts no painel lateral
- painel direito ficou mais organizado, com personalização visual melhor, cor livre e cards mais legíveis
- abas, lista de notas e onboarding receberam acabamento visual para um fluxo mais minimalista e consistente

### Fixed

- tutorial inicial agora se adapta melhor a telas menores e mantém os botões acessíveis

## [1.0.12] - 2026-03-20

### Added

- checklist nativo por nota com contador e persistência
- callout blocks no preview com suporte a `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]` e `> [!BUG]`
- passo de prática guiada no onboarding para validar o app de forma real

### Changed

- cor da nota agora aparece no header, editor, preview, lista de notas e abas
- nota de boas-vindas inicial ficou mais prática, com checklist e callout de exemplo
- README e textos do tutorial agora prometem só o que o app realmente entrega

## [1.0.11] - 2026-03-20

### Adicionado

- Seção de projeto, segurança, privacidade e links úteis nas configurações
- Tutorial de boas-vindas mais completo, com contexto sobre terminal, projeto público, licença e uso responsável
- Arquivos públicos do repositório para projeto open source: `NOTICE.md`, `CODE_OF_CONDUCT.md` e configuração de templates do GitHub

### Alterado

- README, CONTRIBUTING e SECURITY foram reescritos em PT-BR com foco em clareza para usuários e contribuidores
- Metadados públicos do projeto agora apontam o app como mantido por SiriusX
- Workflow de release ganhou mensagem pública mais clara para futuras versões
- Scripts de instalação e documentação oficial foram alinhados somente aos formatos `.deb` e `.exe`

### Corrigido

- Detecção inicial de idioma volta a respeitar o idioma do sistema quando possível
- Distribuição do Tauri foi reduzida para os bundles realmente usados pelo projeto
- Ícone do aplicativo e favicon foram trocados por uma identidade visual própria
- Assets legados e arquivos de plataformas não distribuídas foram removidos do repositório

## [1.0.3] - 2026-03-18

### Adicionado

- Checagem silenciosa de atualização em background com toast de instalação
- Configuração de updater assinada com `latest.json` automática no release workflow
- Ajuste específico de macOS com config dedicada para title bar overlay

### Corrigido

- CI do GitHub agora volta a disparar em `push` no `main` e continua publicando releases em tags `v*`
- Workflow ficou compatível com Windows ao usar `bash` na validação de versão
- Referência do `tauri-action` corrigida para uma versão existente
- Workflow de release voltou para `actions/checkout@v4` e `actions/setup-node@v4`
- `get_platform` agora tem fallback de compilação seguro
- Bordas de resize no Linux não ficam mais acima dos modais
- Enter no modal de confirmação agora respeita o botão focado
- Handler global de atalhos no `App.tsx` não sofre mais com stale closures
- Boilerplate de Go no runner não gera mais quebras de linha extras
- Aba inteira voltou a ser clicável, sem conflito com o botão de fechar
- Diff do histórico usa chave estável
- Remoção de nota ativa usa fallback mais simples e previsível
- Detecção inicial de idioma agora usa o idioma do sistema no primeiro boot
- TitleBar e estados vazios ficaram mais claros para primeira execução

## [1.0.2] - 2026-03-18

### Adicionado

- Suporte inicial a i18n com interface em Inglês, Português (Brasil) e Espanhol
- Tela cheia nativa, Focus Mode e Zen Mode
- Modais customizados para confirmação e entrada de texto
- Abas para múltiplas notas abertas
- Split view com preview de Markdown
- Histórico de versões por nota com restauração
- Find & Replace no editor com painel nativo do CodeMirror
- Temas `dark`, `dark-dimmed` e `midnight`
- Runner com timeout configurável e suporte a TypeScript e Lua
- Exportação de notas como `.md`, `.txt` e `.json`
- Importação por drag and drop de arquivos `.md` e `.txt`
- Job de release para macOS com target universal

### Alterado

- TitleBar agora mostra controles de janela em Linux, Windows e macOS
- StatusBar agora exibe linha, coluna, palavras, caracteres e versão do app
- Editor passou a reconfigurar extensões dinâmicas sem destruir o histórico de undo/redo
- `APP_VERSION` agora vem do `package.json` via Vite
- Workspace padrão interno mudou de `geral` para `general`, com migração do diretório legado

### Corrigido

- Fechamento da janela agora intercepta notas sujas antes de descartar alterações
- Linux ganhou bordas de resize customizadas para janelas sem decoração
- Snippets simples em Go agora recebem `package main` automaticamente quando necessário
- Assets padrão não usados do Vite foram removidos do projeto

## [1.0.1] - 2026-03-18

### Corrigido

- Crash de inicialização no Linux causado pela criação recursiva da nota de boas-vindas
- Workflow de release atualizado para versões mais novas das actions do GitHub

## [1.0.0] - 2026-03-18

### Adicionado

- Primeira versão pública do SiriusPad
- Editor markdown com CodeMirror 6 e tema escuro customizado
- Organização por espaços de trabalho, tags e notas fixadas
- Busca fuzzy em títulos e conteúdo
- Autosave com frontmatter YAML salvo em arquivos `.md`
- Snippet runner para Python, JavaScript, Bash, Shell, Ruby e Go
- Command palette com `Ctrl+K`
- Export para GitHub Gist
- Builds para Linux e Windows com release automática no GitHub Actions
