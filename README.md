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

O banco D1 `biblioteca-virtual` foi criado na Cloudflare e a migração inicial foi aplicada. A API local usa uma cópia local separada; os segredos e a implantação do Worker ainda precisam ser configurados. Não aplique migrações remotas nem publique sem autorização. A API já possui rotas privadas de livros; a interface de login e a estante ainda não estão conectadas e continuam em prévia.

Para informações sensíveis de desenvolvimento futuro, utilize `.dev.vars` local, que não deve ser versionado. Nenhuma credencial é necessária para o teste local descrito acima.

## Proteção das rotas da API

A rota `/api/health` é pública e não retorna dados da coleção. As demais rotas `/api/` exigem um token de ID Firebase válido, emitido para o projeto configurado e para a conta autorizada com login Google. `GET /api/session` confirma uma sessão autorizada sem retornar a identidade. Requisições sem autorização recebem resposta 401; as rotas de livros são privadas.

Para desenvolvimento, copie `.dev.vars.example` para `.dev.vars` e preencha `FIREBASE_PROJECT_ID` e `ALLOWED_FIREBASE_UID` com os valores do seu projeto e da conta autorizada. Nunca inclua valores reais nos arquivos versionados. A integração do login na interface e a configuração das contas ainda precisam ser feitas. A validação verifica assinatura, emissor, público, validade e identidade, mas não consulta revogação antecipada do token; esse comportamento deve ser tratado antes da implantação se for necessário invalidar sessões imediatamente.

## API de livros

Após autenticação, a API oferece `GET /api/books`, `GET /api/books/:id`, `POST /api/books`, `PUT /api/books/:id` e `DELETE /api/books/:id`. IDs são UUIDs. O corpo de criação ou substituição é JSON e contém `title`, `author`, `isbn` (opcional), `quantity`, `status` (`nao_lido`, `lendo`, `concluido` ou `abandonado`), `seriesName` e `seriesVolume` (opcionais) e `genres` (lista opcional de nomes). Título e autor são obrigatórios; o ISBN é validado, convertido para ISBN-13 e duplicatas retornam 409. Todas as rotas da coleção exigem um token válido da conta autorizada.

Esta etapa cobre dados básicos, séries e gêneros. Capas, upload, busca externa, avaliação, comentário formatado e a ligação com a interface ainda serão implementados; os campos existentes de avaliação e comentário não são alterados por essa API. Não use a prévia como coleção pessoal até a implementação e validação dos fluxos restantes.

## Login e estante

O login Google e a consulta da estante dependem de um projeto Firebase configurado, com o provedor Google habilitado e o domínio de acesso autorizado. Copie `.env.example` para `.env` para a configuração **pública** do aplicativo Web e `.dev.vars.example` para `.dev.vars` para a configuração da API. Os dois identificadores de projeto devem apontar para o mesmo projeto, e o UID permitido deve ser o da conta autorizada. Consulte [as variáveis](docs/VARIAVEIS.md) antes de preencher os arquivos.

Após entrar, a estante busca os livros da API, mostra o dashboard e permite pesquisar e abrir as séries em ordem de volume. A interface de cadastro e as capas ainda estão em desenvolvimento. A integração com uma conta Google real e a experiência em dispositivos reais ainda precisam de validação após a configuração das contas.

## Publicação inicial

A versão inicial foi publicada no Cloudflare Workers com o banco D1 remoto e os segredos da API configurados. O endpoint de saúde respondeu corretamente e a API privada recusou requisições sem autenticação. O domínio precisa ser adicionado aos domínios autorizados do Firebase antes da validação do login em produção.

Esta publicação foi feita a partir da compilação local, usando as configurações públicas do `.env`. Um fluxo automático de compilação pelo GitHub ainda não foi configurado; ao configurá-lo, as variáveis `VITE_FIREBASE_*` precisam estar disponíveis na etapa de compilação da Cloudflare. Não inclua o UID ou segredos no frontend.

### Login no celular

Para o login por redirecionamento no domínio publicado, o cliente OAuth Web do Firebase no Google Cloud deve autorizar a URI `https://biblioteca-virtual-api.arquivoslimiar.workers.dev/__/auth/handler`; o domínio do site também precisa constar nos domínios autorizados do Firebase. O Worker encaminha somente `/__/auth/*` para o domínio Firebase correspondente ao projeto configurado, sem expor os dados da coleção. Em desenvolvimento local HTTP, o login continua usando a janela do Google. Valide o fluxo após alterações de domínio ou de configuração OAuth.

## Versionamento

O projeto usa versões semânticas em `package.json` e tags Git no formato `vMAJOR.MINOR.PATCH`. Antes de publicar, registre as alterações, atualize a versão e crie a tag correspondente. A versão `v1.0.1` identifica a correção de login confirmada no celular. A integração com o GitHub deve gerar versões na Cloudflare sem promovê-las automaticamente; a promoção é uma etapa separada.
