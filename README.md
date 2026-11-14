# Documentação da biblioteca virtual

A aplicação está em desenvolvimento; a tela atual é apenas uma prévia visual e ainda não salva dados. Para executá-la localmente, instale as dependências com `npm install` e execute `npm run dev`.

- [Planejamento e decisões](docs/PLANEJAMENTO.md)
- [Fluxo e wireframes](docs/FLUXO-E-WIREFRAMES.md)
- [Backlog de tarefas](docs/BACKLOG.md)
- [Regras de código e trabalho](docs/REGRAS.md)
- [Cores e direção visual](docs/CORES.md)
- [Variáveis de ambiente e locais de configuração](docs/VARIAVEIS.md)

As instruções para agentes estão no [AGENTS.md](AGENTS.md), na raiz do projeto. Em caso de conflito entre decisões antigas e atualizações posteriores, siga a decisão mais recente da proprietária e registre o ajuste.

## Verificações

Execute `npm run typecheck` para conferir os tipos, `npm run lint` para análise de código, `npm test` para os testes e `npm run build` para gerar a versão de produção.

## Ganchos e formatação

Ao instalar as dependências com `npm install`, o comando `prepare` ativa os ganchos do Husky. Antes de cada commit, são executados o ESLint, a verificação de tipos e os testes. A mensagem deve seguir Conventional Commits, em inglês, por exemplo `feat: add book` ou `fix: correct search`.

O comando `npm run format` executa o Prettier e aplica as correções de formatação do ESLint, incluindo linha em branco entre declarações consecutivas de funções, classes e exportações.

## API e banco local

1. Execute `npm install` e, depois, `npm run db:migrate:local` para aplicar as migrações no banco D1 local, armazenado em `.wrangler/` (não versionado).
2. Em um terminal, inicie a API com `npm run dev:api`; em outro, inicie a interface com `npm run dev`. A interface encaminha chamadas `/api` para a API local.
3. Acesse `http://127.0.0.1:8787/api/health` para conferir a conexão e a existência da tabela. A resposta não contém livros nem contagens.

O identificador de banco em `wrangler.jsonc` é apenas um valor fictício para desenvolvimento local. Antes de qualquer implantação futura, será necessário criar e configurar um banco D1 real, vincular a identidade autorizada e configurar segredos. Não aplique migrações remotas nem publique sem autorização. A API já possui rotas privadas de livros; a interface de login e a estante ainda não estão conectadas e continuam em prévia.

Para informações sensíveis de desenvolvimento futuro, utilize `.dev.vars` local, que não deve ser versionado. Nenhuma credencial é necessária para o teste local descrito acima.

## Proteção das rotas da API

A rota `/api/health` é pública e não retorna dados da coleção. As demais rotas `/api/` exigem um token de ID Firebase válido, emitido para o projeto configurado e para a conta autorizada com login Google. `GET /api/session` confirma uma sessão autorizada sem retornar a identidade. Requisições sem autorização recebem resposta 401; as rotas de livros são privadas.

Para desenvolvimento, copie `.dev.vars.example` para `.dev.vars` e preencha `FIREBASE_PROJECT_ID` e `ALLOWED_FIREBASE_UID` com os valores do seu projeto e da conta autorizada. Nunca inclua valores reais nos arquivos versionados. A integração do login na interface e a configuração das contas ainda precisam ser feitas. A validação verifica assinatura, emissor, público, validade e identidade, mas não consulta revogação antecipada do token; esse comportamento deve ser tratado antes da implantação se for necessário invalidar sessões imediatamente.

## API de livros

Após autenticação, a API oferece `GET /api/books`, `GET /api/books/:id`, `POST /api/books`, `PUT /api/books/:id` e `DELETE /api/books/:id`. IDs são UUIDs. O corpo de criação ou substituição é JSON e contém `title`, `author`, `isbn` (opcional), `quantity`, `status` (`nao_lido`, `lendo`, `concluido` ou `abandonado`), `seriesName` e `seriesVolume` (opcionais) e `genres` (lista opcional de nomes). Título e autor são obrigatórios; o ISBN é validado, convertido para ISBN-13 e duplicatas retornam 409. Todas as rotas da coleção exigem um token válido da conta autorizada.

Esta etapa cobre dados básicos, séries e gêneros. Capas, upload, busca externa, avaliação, comentário formatado e a ligação com a interface ainda serão implementados; os campos existentes de avaliação e comentário não são alterados por essa API. Não use a prévia como coleção pessoal até a implementação e validação dos fluxos restantes.
