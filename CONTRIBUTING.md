# Contribuindo com o SiriusPad

Obrigado por considerar contribuir. Este guia é curto, mas cobre o que você precisa para começar sem tropeçar nas partes mais sensíveis do projeto.

## Antes de abrir código

- Para bugs pequenos, pode abrir PR direto.
- Para mudanças maiores, abra uma issue primeiro.
- Se a alteração tocar runner, storage, i18n ou workflow de release, vale alinhar antes.

## Ambiente de desenvolvimento

Requisitos:

- Node.js 20+
- Rust stable via `rustup`
- Linux: `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`

Setup:

```bash
git clone https://github.com/Nic85796/siriuspad
cd siriuspad
npm install
npm run tauri:dev
```

## Estrutura rápida

- `src/`: frontend React + TypeScript
- `src/components/`: layout, editor e UI reutilizável
- `src/store/`: estado global com Zustand
- `src/lib/`: parser, CodeMirror, export, temas e utilitários
- `src/i18n/`: traduções da interface
- `src-tauri/src/commands/`: comandos expostos ao frontend
- `src-tauri/src/storage.rs`: leitura, escrita, trash e histórico das notas

## Adicionando uma nova linguagem ao runner

1. Atualize `src-tauri/src/commands/runner.rs` em `resolve_interpreter()`.
2. Atualize `src/lib/constants.ts` em `NOTE_LANGUAGES`.
3. Se a linguagem for executável, adicione também em `EXECUTABLE_LANGUAGES`.
4. Teste com um snippet curto no app.

## Adicionando uma nova tradução

1. Copie `src/i18n/locales/en.json` para o novo idioma.
2. Traduza os valores, sem mudar as chaves.
3. Adicione a opção em `src/lib/constants.ts`.
4. Registre o locale em `src/i18n/index.ts`.

## Convenções do projeto

- TypeScript sem `any` desnecessário
- Strings de UI via `t(...)`, nunca hardcoded
- Ações destrutivas devem usar modal de confirmação
- Mudanças em notas devem preservar autosave, tabs e histórico
- No Rust, prefira mensagens de erro claras e retornos serializáveis para o frontend

## Commits

Use mensagens descritivas. Exemplos:

- `feat: adicionar preview markdown`
- `fix: corrigir fechamento da janela no linux`
- `docs: reescrever readme em portugues`

## Checklist antes do PR

- Rode `npm run build`
- Rode `cargo check --manifest-path src-tauri/Cargo.toml`
- Atualize traduções se criou UI nova
- Atualize o `CHANGELOG.md` se a mudança for relevante para release
