# Regras de código e trabalho

## Processo

- Seguir a ordem: fluxo e wireframes, validação, protótipo, validação e código.
- Não criar commits antes de a proprietária validar explicitamente o fluxo.
- Usar Conventional Commits depois da autorização: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:` e afins. O uso de commits não autoriza publicação.
- Dividir mudanças em unidades compreensíveis; documentar decisões, pré-requisitos e configuração sem expor segredos.

## Implementação

- Vue.js e Tailwind CSS; componentes pequenos e reutilizáveis, evitando concentrar toda a aplicação em um arquivo.
- Separar apresentação, estado, acesso à API e regras de negócio; organizar por funcionalidade conforme o projeto crescer.
- Priorizar tela pequena, toque confortável, teclado, nomes acessíveis, contraste e estados de carregamento, erro, vazio e sucesso.
- Manter temas e cores em tokens compartilhados; respeitar a preferência do sistema e permitir troca manual, se aprovada.
- Validar dados no cliente para orientar e no servidor para proteger integridade; usar consultas parametrizadas e migrações para D1.
- Verificar autenticação e autorização em todos os endpoints privados; nunca confiar apenas em controles da interface nem expor chaves privadas.
- Usar variáveis de ambiente e segredos da plataforma; manter exemplos sem valores sensíveis.
- Não presumir que dados ou capas de serviços externos existem; limitar requisições, tratar falhas e apresentar alternativas.
- Escolher dependências mantidas e gratuitas para o uso previsto; evitar dependências desnecessárias.

## Qualidade

- Configurar ESLint e Prettier com comandos documentados e regras compatíveis.
- Configurar Husky para verificações locais adequadas; validar mensagens de commit no padrão Conventional Commits, respeitando a restrição anterior.
- Testar regras importantes, endpoints privados e fluxos críticos; verificar acessibilidade, câmera e responsividade em dispositivos/navegadores reais quando disponíveis.
- Documentar como executar, testar e implantar, além dos limites dos serviços e da recuperação/exportação dos dados.

## Segurança e testes — requisitos adicionais

- Nunca inserir credenciais, tokens, chaves privadas ou outros valores sensíveis no código versionado, em URLs, mensagens de erro ou registros. Usar variáveis de ambiente e segredos apropriados à plataforma; fornecer somente exemplos sem valores reais.
- Tratar como públicos os valores incluídos no código entregue ao navegador: somente configurações deliberadamente públicas podem estar nele. Autorização, segredos e verificações de acesso ficam no servidor.
- Selecionar versões mantidas e verificar vulnerabilidades conhecidas antes da adoção e nas atualizações. Corrigir ou substituir dependências afetadas; se não houver versão sem vulnerabilidades conhecidas, registrar o risco e buscar alternativa. Não presumir ausência absoluta de vulnerabilidades.
- Revisar dependências diretas e transitivas e executar auditoria adequada ao gerenciador de pacotes; não aplicar correções incompatíveis automaticamente sem avaliação.
- Criar testes significativos para regras de negócio e funções críticas, incluindo validação de ISBN, duplicidade, contagem, status, autorização e tratamento das integrações. Não criar testes apenas para estilização.
- Testar falhas e casos de borda relevantes e manter os testes independentes de serviços externos sempre que possível; documentar verificações manuais que dependam de câmera ou contas reais.

- Usar notificações acessíveis por biblioteca compatível com Vue para operações de carregamento, sucesso e erro; complementar com mensagens persistentes quando necessário. Implementar página 404 e erros recuperáveis, sem expor detalhes sensíveis.

## Ícones

- Usar Phosphor Icons com a integração oficial para Vue, verificando manutenção, versão e vulnerabilidades conhecidas na instalação.
- Manter uma pasta dedicada a ícones e centralizar nela as importações e a disponibilização dos ícones usados pela aplicação. Importar apenas os ícones necessários, sem carregar a biblioteca inteira.
- Ícones que representem ações devem ter nomes acessíveis; ícones puramente decorativos devem ser ignorados por leitores de tela.

- Conteúdo rico informado pela usuária é dado não confiável: validar e sanitizar no servidor com uma lista de permissões e renderizar com segurança; testar scripts, atributos e URLs maliciosos, além da preservação dos formatos aceitos.

## TypeScript

- Priorizar TypeScript no código novo do frontend, backend e testes, com tipos explícitos nas fronteiras entre componentes, API, dados externos e banco.
- Adotar verificação de tipos e configuração estrita adequada ao projeto, sem recorrer a `any` para contornar erros; tratar entradas externas como não confiáveis e validá-las em tempo de execução.
- Migrar arquivos JavaScript existentes gradualmente, conforme forem alterados e sem interromper o funcionamento; não tratar tipagem como substituta de validação, testes ou medidas de segurança.

- O comando de formatação deve manter uma linha em branco entre declarações consecutivas de funções, classes e exportações. O Husky verifica lint, tipos e testes antes dos commits; as mensagens seguem Conventional Commits.

## Idioma dos commits e conclusão de tarefas

- Escrever todas as mensagens de commit em inglês, seguindo Conventional Commits, por exemplo `feat: add book search` ou `fix: validate ISBN`.
- Ao concluir cada tarefa de implementação, executar `npm run lint` para identificar erros e `npm run format` para formatar o código; corrigir falhas e repetir a verificação quando a formatação ou correção alterar o código.
- Executar também verificação de tipos e testes adequados à alteração. Revisar o resultado da formatação para preservar mudanças existentes.

## Organização de pastas

- Agrupar código próprio de uma funcionalidade em `src/features/<funcionalidade>`, incluindo seus componentes e regras de domínio. Componentes genéricos e reutilizáveis entre funcionalidades devem ficar em `src/ui`; criar a pasta quando houver um componente desse tipo.
- Manter testes em `tests/`, organizados por funcionalidade ou área (`tests/features`, `tests/worker`, `tests/database`), sem espalhá-los pelas pastas de produção.
- Manter ícones centralizados em `src/icons`, código do servidor em `worker` e migrações em `migrations`. Evitar pastas vazias e abstrações sem uso.

- Manter `docs/VARIAVEIS.md` e os exemplos sem valores reais atualizados a cada variável adicionada, alterada ou removida, indicando onde configurá-la em desenvolvimento e produção.
