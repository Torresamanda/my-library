# Instruções para trabalhar neste projeto

## Comece por aqui

Leia [docs/README.md](docs/README.md), [docs/PLANEJAMENTO.md](docs/PLANEJAMENTO.md), [docs/FLUXO-E-WIREFRAMES.md](docs/FLUXO-E-WIREFRAMES.md), [docs/REGRAS.md](docs/REGRAS.md), [docs/CORES.md](docs/CORES.md) e [docs/BACKLOG.md](docs/BACKLOG.md) antes de alterar funcionalidades. As decisões mais recentes da proprietária prevalecem sobre propostas antigas. Registre mudanças de escopo ou decisões na documentação e mantenha o backlog atualizado. Peça esclarecimento quando uma decisão essencial continuar indefinida; não trate uma sugestão como aprovada.

## Processo

- Respeite a sequência fluxo → wireframes → protótipo → código e as validações da proprietária. O fluxo e a direção visual “Lilás contemporâneo” foram revisados e a implementação inicial foi autorizada; valide mudanças relevantes de fluxo ou aparência antes de presumir aprovação.
- O fluxo inicial foi validado. Ao concluir cada tarefa, registre as alterações pertinentes em commit, sem incluir segredos nem trabalho alheio, seguindo Conventional Commits em inglês. Mudanças relevantes de fluxo ou aparência exigem validação antes de avançar.
- Não publique nem ative serviços pagos sem autorização. Mantenha os serviços dentro dos planos gratuitos e documente limitações e configurações necessárias.
- A tela atual é uma prévia em desenvolvimento; não apresente dados simulados ou funcionalidades incompletas como reais. Não há página de perfil: o acesso é exclusivo da proprietária por Google.

## Desenvolvimento

- Utilize Vue e Tailwind, componentes pequenos e reutilizáveis, e mantenha ícones Phosphor centralizados em `src/icons`, importando apenas os necessários.
- Priorize uso em celular e também adapte telas e interações ao computador; assegure acessibilidade, navegação por teclado, contraste e estados de carregamento, vazio, sucesso e erro, incluindo página 404.
- Mantenha as paletas e a direção visual documentadas, com temas claro e escuro. Preserve as regras de séries, edições, quantidades, ISBN, status, avaliação e comentário descritas no planejamento atualizado.
- Use ESLint, Prettier e Husky; valide mensagens de commit com Conventional Commits. O repositório precisa estar configurado para que os ganchos do Husky funcionem.
- Faça testes úteis para regras e funções críticas, como ISBN, duplicidade, contagem, autenticação, autorização e conteúdo rico; não crie testes somente para estilização. Execute verificações adequadas às alterações e relate limites dos testes.

## Segurança

- Nunca inclua segredos, credenciais ou valores sensíveis no código versionado, em URLs, mensagens de erro ou logs. Configurações distribuídas ao navegador são públicas; faça autorização e verificações sensíveis no servidor.
- Limite o acesso à conta Google autorizada e proteja todos os endpoints privados. Valide entradas no servidor, use consultas parametrizadas e trate dados externos como não confiáveis.
- Verifique manutenção e vulnerabilidades conhecidas de dependências, avalie alertas e não presuma segurança absoluta.
- Valide e sanitize conteúdo rico com uma lista de formatações permitidas; não execute HTML ou scripts arbitrários. Valide uploads por conteúdo e tamanho no servidor e restrinja-os a livros sem ISBN.

## Organização

- Documentação de projeto fica em `docs/`; este `AGENTS.md` permanece na raiz para descoberta automática por ferramentas e chats.
- Não exponha dados pessoais nas alterações ou exemplos. Não sobrescreva trabalho preexistente sem necessidade.
- Priorize TypeScript para código novo de frontend, backend e testes; confira tipos nas fronteiras, valide entradas externas em tempo de execução e migre JavaScript existente gradualmente. Consulte `docs/REGRAS.md`.

- Escreva todas as mensagens de commit em inglês e no padrão Conventional Commits. Ao concluir cada tarefa de implementação, execute `npm run lint` e `npm run format`, corrija eventuais erros e repita as verificações necessárias após alterações; preserve o trabalho existente.

- Organize funcionalidades em `src/features/<funcionalidade>`; componentes genéricos reutilizáveis ficam em `src/ui`. Os testes permanecem em `tests/`, separados por funcionalidade ou área. Ícones permanecem em `src/icons`; veja `docs/REGRAS.md`.

- Documente toda variável de ambiente em `docs/VARIAVEIS.md`, incluindo finalidade, obrigatoriedade e local de configuração local e de produção. Atualize exemplos sem valores reais sempre que houver mudanças.

- Antes de publicar uma nova versão, atualize a versão semântica no projeto, registre as alterações em commit e identifique o commit com a tag correspondente. A publicação deve ser rastreável à versão; não publique código não versionado. A integração com a Cloudflare deve criar versões sem promover automaticamente cada alteração à produção.

- Versione todas as modificações do projeto em commits rastreáveis ao concluir cada tarefa. Use tags semânticas para versões de publicação; commit e tag não autorizam publicar automaticamente.
