# Instruções para trabalhar neste projeto

## Comece por aqui

Leia [docs/README.md](docs/README.md), [docs/PLANEJAMENTO.md](docs/PLANEJAMENTO.md), [docs/FLUXO-E-WIREFRAMES.md](docs/FLUXO-E-WIREFRAMES.md), [docs/REGRAS.md](docs/REGRAS.md), [docs/CORES.md](docs/CORES.md) e [docs/BACKLOG.md](docs/BACKLOG.md) antes de alterar funcionalidades. As decisões mais recentes da proprietária prevalecem sobre propostas antigas. Registre mudanças de escopo ou decisões na documentação e mantenha o backlog atualizado. Peça esclarecimento quando uma decisão essencial continuar indefinida; não trate uma sugestão como aprovada.

## Processo

- Respeite a sequência fluxo → wireframes → protótipo → código e as validações da proprietária. O fluxo e a direção visual “Lilás contemporâneo” foram revisados e a implementação inicial foi autorizada; valide mudanças relevantes de fluxo ou aparência antes de presumir aprovação.
- Não faça commits antes de validação do fluxo. O fluxo foi validado para o trabalho inicial; a existência dessa validação não é, por si só, um pedido para criar commits. Use Conventional Commits quando criar commits autorizados.
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
