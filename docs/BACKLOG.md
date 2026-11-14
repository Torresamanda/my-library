# Backlog — biblioteca virtual

Status inicial: planejamento. Itens são propostas, não funcionalidades já implementadas. Ajustar prioridade e escopo após as respostas e validações.

## 1. Descoberta e decisões

- [ ] Definir campos obrigatórios e opcionais, incluindo status, notas, datas e avaliação, se desejados.
- [ ] Decidir se quantidade representa exemplares por edição e como tratar edições e ISBNs duplicados.
- [ ] Definir organização de sagas: ordem, volumes ausentes e eventual cadastro independente.
- [ ] Definir se gêneros e etiquetas são livres, predefinidos ou ambos; permitir mais de um gênero se aprovado.
- [ ] Decidir tela inicial, busca, filtros, ordenação, estatísticas e opções da primeira versão.
- [ ] Definir comportamento sem resultado, sem capa e para livros sem ISBN.
- [ ] Confirmar acesso exclusivo à conta autorizada, necessidades de backup, dispositivos e navegadores.
- [ ] Definir nome, estilo visual, preferência inicial dos temas e persistência da escolha.
- [ ] Separar funcionalidades essenciais das posteriores com a proprietária.

## 2. Fluxo e wireframes

- [ ] Mapear entrada, estante, busca e filtros, detalhe, adição, edição e exclusão.
- [ ] Desenhar fluxo de adição: câmera ou digitação → consulta → escolha e revisão → salvar; incluir falha e cancelamento.
- [ ] Definir fluxo para duplicatas, acesso negado, ausência de câmera, falha de rede e ausência de capa.
- [ ] Criar wireframes mobile primeiro e adaptação para telas maiores; incluir navegação entre telas.
- [ ] Revisar e obter validação explícita do fluxo antes de commits e da próxima etapa.

## 3. Protótipo

- [ ] Criar protótipo visual a partir do fluxo aprovado, com temas claro e escuro e cores em CORES.md.
- [ ] Demonstrar telas e estados principais, inclusive vazios, carregamento e erros; validar tamanho de toque e contraste.
- [ ] Ajustar conforme retorno e obter validação antes de implementar.

## 4. Base do projeto

- [ ] Criar projeto Vue e Tailwind, estrutura por funcionalidades, rotas e componentes compartilhados.
- [ ] Configurar ESLint, Prettier e Husky, validação de Conventional Commits e comandos de qualidade.
- [ ] Configurar ambientes locais, variáveis de exemplo sem segredos, D1 local, migrações e documentação de execução.
- [ ] Configurar publicação Cloudflare, sem ativar plano pago; documentar contas e configurações necessárias.

## 5. Interface

- [ ] Criar estrutura responsiva, navegação, tokens, alternância de temas e persistência da preferência aprovada.
- [ ] Criar entrada com Google, saída, acesso negado e estados de sessão, sem página de perfil.
- [ ] Criar estante com capas, dados essenciais, busca, filtros, ordenação, estados vazios e carregamento.
- [ ] Criar detalhe de livro e ações de editar e excluir com confirmação.
- [ ] Criar formulário de livro, validação, edição de metadados e campos aprovados.
- [ ] Criar leitor de código de barras pela câmera e entrada manual de ISBN; permitir busca alternativa aprovada.
- [ ] Criar seleção e confirmação de resultados, identificar duplicatas e oferecer tratamento decidido.
- [ ] Apresentar imagem padrão para capa ausente ou quebrada, mensagens claras e opção de tentar novamente.
- [ ] Implementar telas e interações de sagas, gêneros e quantidade conforme decisões.

## 6. Servidor, dados e integrações

- [ ] Modelar livros, edições, quantidades, gêneros e sagas conforme decisões; criar migrações, índices e restrições.
- [ ] Integrar login Google escolhido; verificar assinatura, emissor, público e validade do token no servidor.
- [ ] Restringir todos os endpoints privados à identidade Google autorizada; testar usuário não autorizado, token inválido e ausência de sessão.
- [ ] Criar endpoints de listar, buscar, detalhar, adicionar, editar e excluir; validar entradas e parametrizar SQL.
- [ ] Criar operações de sagas e gêneros conforme o modelo aprovado; definir política de exclusão e integridade.
- [ ] Normalizar e validar ISBN-10/13; consultar Google Books e alternativa Open Library, considerando limites, termos, erros e dados divergentes.
- [ ] Persistir dados selecionados e referência de capa quando disponível; tratar indisponibilidade e capa padrão sem obrigar envio manual.
- [ ] Definir exportação e recuperação da coleção; documentar limites D1 e plano de backup.
- [ ] Configurar segredos, políticas de acesso e mensagens seguras; não expor dados privados ou credenciais.

## 7. Verificação e entrega

- [ ] Testar regras de ISBN, duplicidade, quantidade e relacionamentos conforme decisões.
- [ ] Testar autenticação/autorização, operações de dados e falhas dos serviços externos.
- [ ] Testar fluxos em celulares e navegadores escolhidos, permissões de câmera, orientação, teclado e acessibilidade.
- [ ] Executar verificações de código e compilação; revisar experiência nos dois temas e telas maiores.
- [ ] Documentar preparação de contas, configuração, execução, publicação, limitações, manutenção e backup.
- [ ] Validar implantação e fluxo completo com a proprietária dentro dos limites gratuitos.

## Respostas registradas

- Dados básicos, gênero, saga, quantidade e status de leitura.
- Cadastro e quantidade por edição; cadastro manual e capa padrão como alternativas.
- Estante com busca e filtros como página inicial; estética aconchegante e delicada.
- Acesso exclusivo à conta Google da proprietária; sem perfil.

Wireframes iniciais preparados em [FLUXO-E-WIREFRAMES.md](FLUXO-E-WIREFRAMES.md); aguardam avaliação. Itens mais específicos das seções anteriores continuam pendentes até definição e validação.

### Respostas adicionais registradas

- Status: não lido, lendo e lido.
- Múltiplos gêneros por livro, com criação de novos gêneros.
- Saga com nome e número do volume por livro.
- ISBN duplicado abre a edição existente para ajuste da quantidade.

Os itens gerais acima sobre esses temas devem ser lidos à luz dessas decisões; restam os detalhes de implementação e validação do fluxo.

### Agrupamento por série

- [ ] Projetar controle de agrupamento na estante, com grupos expansíveis e livros sem série apresentados individualmente.
- [ ] Ordenar os livros da série pelo número do volume, mantendo edições diferentes separadas.
- [ ] Fazer busca e filtros funcionarem com o agrupamento ativo e ocultar grupos sem resultados.
- [ ] Modelar e consultar nome da série e número do volume, respeitando edição e quantidade independentes.
- [ ] Validar se o agrupamento deve iniciar ativo e como exibir os totais de cada série.

### Alterações mais recentes

- [ ] Exigir nome e autor; permitir cadastro sem ISBN.
- [ ] Permitir adicionar capa manual somente para livro sem ISBN; definir armazenamento gratuito, validação da imagem e seus limites.
- [ ] Usar capa obtida por consulta para livros com ISBN ou capa padrão se indisponível; não oferecer envio manual nesses casos.
- [ ] Usar tags de leitura concluído, lendo e abandonado, com status individual por livro; esclarecer relação com múltiplos exemplares.
- [ ] Ao detectar ISBN já cadastrado, exibir toast informando que o livro já está na biblioteca e impedir duplicação. Esta decisão substitui a anterior de abrir a edição existente.

### Mini dashboard

- [ ] Desenhar quatro indicadores compactos no topo da estante: total, lidos, lendo e abandonados, incluindo estado vazio.
- [ ] Definir a regra de contagem de exemplares e status quando uma edição tiver quantidade maior que um.
- [ ] Calcular os indicadores com dados autorizados e atualizá-los após criação, edição ou exclusão.
- [ ] Verificar apresentação em telas pequenas e consistência dos totais com a regra aprovada.

- [x] Definir status único por livro cadastrado, mesmo com múltiplos exemplares. Indicadores por status contam cadastros, não exemplares.
- [ ] Definir separadamente se o total geral do dashboard soma exemplares ou conta livros cadastrados.

### Segurança e testes

- [ ] Configurar armazenamento seguro de segredos e variáveis; garantir que valores sensíveis não apareçam no repositório, URLs, respostas ou registros.
- [ ] Identificar configurações públicas do navegador e manter verificações de acesso e segredos no servidor.
- [ ] Selecionar dependências mantidas, verificar vulnerabilidades conhecidas e documentar a auditoria e o tratamento de alertas.
- [ ] Criar testes significativos para regras de negócio, autenticação/autorização, ISBN, duplicidade, contagem e erros de integração; não criar testes de estilização.
- [ ] Incluir verificações de segurança e testes pertinentes nos comandos de qualidade e na preparação para implantação.

### Decisões: dashboard, séries e status

- [x] Total geral soma exemplares; indicadores de leitura contam cada livro cadastrado uma vez.
- [x] Estante abre com séries agrupadas em cartões quadrados com até quatro miniaturas e nome da série; abrir os volumes em ordem. Livros sem série aparecem individualmente.
- [x] Status: não lido, concluído, lendo e abandonado.
- [x] Sem resultado por ISBN, permitir preencher dados manualmente e usar capa padrão; envio de capa manual permanece restrito a livros sem ISBN.
- [ ] Definir detalhes da seleção, armazenamento gratuito e limites das capas manuais para livros sem ISBN.

Estas decisões substituem dúvidas e propostas anteriores conflitantes neste arquivo.

### Regras para imagem de capa

- [x] Seleção pela galeria ou arquivos do dispositivo para livros sem ISBN; formatos permitidos: JPG, JPEG e PNG.
- [ ] Validar proposta de limite de 5 MB por imagem; exibir erro compreensível para arquivo inválido ou acima do limite.
- [ ] Escolher armazenamento gratuito compatível com o volume de imagens e documentar cotas e recuperação.
- [ ] Validar tamanho e conteúdo da imagem no servidor, além de restringir a seleção no navegador; proteger gravação por autorização.

### Tratamento de erros e notificações

- [ ] Escolher biblioteca de toast compatível com Vue, mantida e com versão verificada quanto a vulnerabilidades conhecidas.
- [ ] Exibir notificações acessíveis de carregamento, sucesso na criação, edição e exclusão e falhas, inclusive ISBN duplicado.
- [ ] Criar página 404 com opção de voltar à estante e tratar erros de rede, sessão, câmera, busca, imagem e gravação.
- [ ] Exibir orientações persistentes junto a campos ou áreas quando necessário, permitir nova tentativa e preservar dados preenchidos quando possível.
- [ ] Testar os fluxos de erro e sucesso relevantes, sem expor informações sensíveis ou detalhes internos nas mensagens.

### Ícones

- [ ] Instalar a integração Phosphor Icons para Vue em versão adequada e verificada.
- [ ] Criar pasta dedicada a ícones e importar individualmente somente os ícones necessários.
- [ ] Garantir nomes acessíveis em ações e ocultar ícones decorativos dos leitores de tela.

- [x] Escolher direção visual: versão 3, “Lilás contemporâneo”.
- [ ] Detalhar e validar as telas e os estados do protótipo nessa direção, incluindo tema claro e adaptação para celular, antes da implementação.

### Computador e anotações

- [ ] Desenhar e validar a versão para computador da estante, dashboard, séries, detalhes e cadastro, aproveitando o espaço disponível.
- [ ] Adaptar filtros, formulários e navegação a teclado e mouse, mantendo experiência acessível e utilizável no celular.
- [ ] Definir com a proprietária o formato e as regras das anotações por livro.
- [ ] Projetar e implementar interface e persistência das anotações conforme a decisão, com validação, autorização e tratamento de erro.
- [ ] Verificar o fluxo de anotações e a responsividade em tamanhos de tela de celular e computador.

### Avaliação e comentário pessoal

- [x] Incluir avaliação de até cinco estrelas e breve comentário pessoal opcional por livro.
- [ ] Definir obrigatoriedade da avaliação, se aceita frações e o limite do comentário.
- [ ] Desenhar avaliação e comentário na tela de detalhes e edição, com acesso por toque, mouse e teclado.
- [ ] Persistir e proteger os dados por livro; validar entradas e tratar falhas ao salvar.
- [ ] Testar salvamento, edição, ausência de comentário e regras de validação aprovadas.

### Avaliação e texto rico — decisões confirmadas

- [x] Avaliação opcional com estrelas inteiras de 1 a 5; comentário opcional de até 500 caracteres de texto visível.
- [ ] Projetar editor acessível e responsivo com negrito, emojis e diferentes níveis de título, com contador e indicação clara do limite.
- [ ] Escolher editor Vue mantido e verificar vulnerabilidades; definir e documentar contagem consistente de emojis e quebras de linha, sem contar marcação de formatação.
- [ ] Validar limite e formato no cliente e no servidor; permitir somente formatações aprovadas e sanitizar armazenamento/renderização contra conteúdo malicioso.
- [ ] Testar limite, emojis, formatação permitida, remoção de conteúdo perigoso, salvamento e edição.

### Progresso da base de dados e segurança

- [x] Criar migração SQLite inicial para livros, gêneros e relacionamentos, com restrições de quantidade, status, avaliação e ISBN único.
- [x] Implementar normalização e validação de ISBN-10 e ISBN-13 e contagem do dashboard, com testes.
- [x] Preparar verificação de token Firebase para identidade Google autorizada, com testes de acesso permitido e negado.
- [ ] Integrar a verificação a todos os endpoints da API e configurar identidade autorizada como segredo; o módulo isolado ainda não protege aplicação alguma.
- [ ] Configurar e aplicar a migração no Cloudflare D1 e implementar operações de dados com validação completa, incluindo conteúdo rico seguro.

### TypeScript

- [x] Configurar TypeScript e verificação de tipos para interface, servidor e testes.
- [x] Migrar o código existente e priorizar TypeScript em código novo, com validação em tempo de execução nas fronteiras.

### Migração realizada

- [x] Configurar TypeScript estrito, verificação de tipos com `vue-tsc` e análise de arquivos TypeScript e Vue no ESLint.
- [x] Migrar a aplicação existente, regras de domínio, autenticação, testes e configuração do Vite para TypeScript. Configurações de ferramentas que continuam em JavaScript não fazem parte do código da aplicação.
- [x] Executar verificação de tipos, testes, lint e compilação.
- [ ] Acompanhar a correção do alerta moderado de `minimatch`, dependência transitiva da ferramenta de desenvolvimento `typescript-eslint`. Auditoria de produção sem alertas conhecidos; evitar substituir dependências à força por versões incompatíveis.

### Ganchos e formatação

- [x] Configurar Husky para executar lint, verificação de tipos e testes antes do commit.
- [x] Validar mensagens de commit com Conventional Commits.
- [x] Aplicar linha em branco entre declarações consecutivas de funções, classes e exportações no comando de formatação.

### Padrão de commits e tarefas

- [x] Registrar que todas as mensagens de commit devem ser em inglês e seguir Conventional Commits.
- [x] Registrar a execução de ESLint e formatação ao concluir cada tarefa de implementação, com correção e nova verificação quando necessário.

### Estrutura por funcionalidade

- [x] Organizar a funcionalidade de biblioteca e as regras de ISBN em `src/features` e manter os testes em `tests/`, separados por área.
- [x] Registrar `src/ui` como local de componentes genéricos reutilizáveis quando eles forem criados; preservar `src/icons` como pasta central de ícones.

### D1 e API locais

- [x] Configurar Worker e vínculo D1 para desenvolvimento local com Wrangler, sem vincular banco remoto.
- [x] Aplicar a migração inicial ao D1 local e conectar o Worker ao banco com verificação de disponibilidade sem dados privados.
- [x] Encaminhar `/api` da interface de desenvolvimento para o Worker local e documentar execução.
- [ ] Integrar autenticação aos endpoints de dados antes de criá-los ou expor livros; implementar operações da coleção em etapa posterior.
- [ ] Criar e vincular banco real apenas na implantação autorizada; substituir o identificador fictício e configurar segredos fora do repositório.

### Proteção da API

- [x] Exigir verificação de token e identidade autorizada em todas as rotas privadas da API; manter apenas a verificação de saúde sem dados como pública.
- [x] Criar `GET /api/session` para confirmar uma sessão válida sem expor a identidade e tratar configurações ausentes sem liberar acesso.
- [x] Testar autorização, erros de assinatura e validade e garantir que chamadas não autorizadas não consultem o banco.
- [ ] Integrar login Google/Firebase na interface e configurar o projeto e a conta autorizada no ambiente real.
- [ ] Avaliar e implementar revogação antecipada de sessões antes de produção se for necessário invalidá-las imediatamente.

### API de livros — primeira versão

- [x] Criar operações privadas para listar, consultar, cadastrar, editar e excluir livros no D1, com consultas parametrizadas.
- [x] Validar dados básicos, quantidade, status, nome e volume da série, gêneros e ISBN; normalizar ISBN e rejeitar duplicatas com resposta 409.
- [x] Salvar a edição e seus gêneros em lote transacional e testar os fluxos com SQLite isolado e autorização simulada.
- [ ] Implementar e testar capas, avaliação e comentário rico com validação e sanitização; integrar busca externa, câmera e interface.
- [ ] Validar a API completa com autenticação Google e D1 reais após configuração das contas, antes de implantação.
