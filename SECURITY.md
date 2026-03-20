# Política de Segurança

O SiriusPad é um app desktop local-first. Mesmo assim, ele toca áreas sensíveis como execução de comandos, leitura e escrita de arquivos locais, auto-update e integrações opcionais com GitHub.

## Versões suportadas

| Versão | Suporte |
|--------|---------|
| 1.x | ✅ Ativo |

## Escopo de segurança atual

As áreas mais críticas hoje são:

- terminal embutido e execução de snippets locais
- leitura, escrita, histórico e lixeira de notas no disco
- armazenamento local do token do GitHub para exportação de Gist
- fluxo de atualização automática via releases assinadas
- permissões de janela, shell e webview do Tauri

## Como reportar uma vulnerabilidade

Se você encontrou uma vulnerabilidade no SiriusPad, **não abra issue pública**.

Use uma Security Advisory privada:

https://github.com/Nic85796/siriuspad/security/advisories/new

Inclua, se possível:

- versão do SiriusPad
- sistema operacional
- impacto observado
- passos para reproduzir
- prova de conceito mínima
- mitigação sugerida, se existir

## Prazo de resposta

- triagem inicial: até 72 horas
- atualização de status: assim que a análise técnica avançar
- correção pública: assim que houver patch ou mitigação segura

## Boas práticas para usuários

- rode apenas comandos que você entende
- não publique tokens, logs sensíveis ou notas privadas em issues
- prefira releases oficiais do GitHub do projeto
- mantenha o app atualizado para receber correções de segurança
