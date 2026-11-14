# Documentação da biblioteca virtual

A aplicação está em desenvolvimento; a tela atual é apenas uma prévia visual e ainda não salva dados. Para executá-la localmente, instale as dependências com `npm install` e execute `npm run dev`.

- [Planejamento e decisões](docs/PLANEJAMENTO.md)
- [Fluxo e wireframes](docs/FLUXO-E-WIREFRAMES.md)
- [Backlog de tarefas](docs/BACKLOG.md)
- [Regras de código e trabalho](docs/REGRAS.md)
- [Cores e direção visual](docs/CORES.md)

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

O identificador de banco em `wrangler.jsonc` é apenas um valor fictício para desenvolvimento local. Antes de qualquer implantação futura, será necessário criar e configurar um banco D1 real, vincular a identidade autorizada e configurar segredos. Não aplique migrações remotas nem publique sem autorização. O login e os endpoints de dados ainda não foram integrados; o site continua sendo uma prévia sem persistência de livros.

Para informações sensíveis de desenvolvimento futuro, utilize `.dev.vars` local, que não deve ser versionado. Nenhuma credencial é necessária para o teste local descrito acima.
