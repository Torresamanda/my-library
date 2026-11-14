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

