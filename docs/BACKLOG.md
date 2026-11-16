# Backlog — biblioteca virtual

## Situação atual

A versão 1.3.0 foi publicada a partir do commit `0276253` e da tag `v1.3.0`. As funcionalidades abaixo estão disponíveis em produção, mas ainda precisam de validação em dispositivos reais. A tarefa de capas continua parcialmente concluída: falta implementar o envio manual.

### Concluído no repositório

- [x] Cadastro manual com ISBN opcional, consulta e leitura pela câmera, preenchimento dos dados disponíveis e detecção de ISBN duplicado.
- [x] Até quatro gêneros, editora e páginas por edição; detalhes, edição e exclusão com confirmação.
- [x] Capas automáticas e imagem padrão; avaliação opcional e comentário com formatação permitida e limite validado no servidor.
- [x] Busca, filtros, ordenação, agrupamento de séries, notificações, página 404 e estados de carregamento e erro.
- [x] Testes automatizados de regras e API, ESLint, verificação de tipos e compilação; 53 testes passaram na última execução.

### Próximos passos

- [ ] Implementar envio privado de capa JPG, JPEG ou PNG de até 2 MB para livros sem ISBN; validar conteúdo e tamanho no servidor, tratar falhas e exclusão e preparar a configuração do R2 sem ativar serviços pagos.
- [ ] Validar, em celular e computador, os fluxos implementados, leitura pela câmera, editor de comentário, foco, notificações e temas claro e escuro, com autorização para o acesso necessário.
- [ ] Investigar e reduzir o tamanho do arquivo principal gerado na compilação, que excede o limite de aviso da ferramenta.
- [ ] Conferir a configuração efetiva da integração Git com a Cloudflare; a consulta anterior foi negada por falta de permissão. Não presumir que um envio ao Git não publique automaticamente.
- [x] Aplicar a migração `0002_book_metadata.sql` ao D1 remoto, registrar e identificar a versão 1.3.0 e publicá-la a partir do código versionado.
- [ ] Antes das próximas publicações, manter a mesma sequência de verificações, versão, commit e tag.
- [ ] Definir e documentar backup e recuperação da coleção e os limites dos serviços.

Os bancos local e remoto receberam a migração 0002. Após a migração local, a proprietária confirmou que a estante local voltou a abrir; os dois bancos permanecem independentes.

## Histórico de planejamento

As seções históricas abaixo preservam propostas e decisões anteriores; consulte a situação atual e os registros de progresso ao final quando houver divergência.

## Manual visual

- [x] Criar estados visuais de carregamento, página de endereço inexistente e mensagens para acesso restrito e falha de carregamento.
- [ ] Validar os estados de erro, a página 404 e as animações em dispositivos reais e com tecnologias assistivas. A página 404 é renderizada pela aplicação; o retorno HTTP depende da configuração SPA da hospedagem.
- [x] Abrir o cadastro em painel lateral responsivo e posicionar a câmera junto ao ISBN e os indicadores de obrigatoriedade junto aos rótulos.
- [ ] Validar o painel, o foco e a leitura da câmera em navegadores e dispositivos reais.
- [x] Criar manual visual e wireframe em HTML com exemplos para celular e computador, escala de espaçamento, cantos e paletas.
- [ ] Validar o manual visual e o tema claro com a proprietária antes de mudanças relevantes na aparência.
- [x] Adaptar a estante, o dashboard, o acesso e o cadastro existentes às cores, aos espaçamentos e aos cantos do manual visual.
- [ ] Validar visualmente as telas ajustadas nos temas claro e escuro, em celular e computador, e aplicar eventuais correções.

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
- [x] Definir que o total geral soma exemplares; indicadores por status contam cada cadastro uma vez.

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
- [x] Definir seleção de JPG, JPEG ou PNG, limite de 2 MB e uso previsto do R2 para livros sem ISBN.
- [ ] Implementar armazenamento, seleção, validação e tratamento de falhas para capas manuais.

Estas decisões substituem dúvidas e propostas anteriores conflitantes neste arquivo.

### Regras para imagem de capa

- [x] Seleção pela galeria ou arquivos do dispositivo para livros sem ISBN; formatos permitidos: JPG, JPEG e PNG.
- [x] Definir limite de 2 MB por imagem, substituindo a proposta anterior de 5 MB.
- [ ] Exibir erro compreensível para arquivo inválido ou acima do limite de 2 MB.
- [x] Escolher R2 como opção de armazenamento privado.
- [ ] Preparar e configurar o R2, documentar cotas, custos ao exceder a franquia e recuperação, sem ativar serviços pagos.
- [ ] Validar tamanho e conteúdo da imagem no servidor, além de restringir a seleção no navegador; proteger gravação por autorização.

### Tratamento de erros e notificações

- [x] Usar vue-sonner para notificações, com auditoria de dependências de produção sem vulnerabilidades conhecidas na verificação realizada.
- [ ] Exibir notificações acessíveis de carregamento, sucesso na criação, edição e exclusão e falhas, inclusive ISBN duplicado.
- [ ] Criar página 404 com opção de voltar à estante e tratar erros de rede, sessão, câmera, busca, imagem e gravação.
- [ ] Exibir orientações persistentes junto a campos ou áreas quando necessário, permitir nova tentativa e preservar dados preenchidos quando possível.
- [ ] Testar os fluxos de erro e sucesso relevantes, sem expor informações sensíveis ou detalhes internos nas mensagens.

### Ícones

- [x] Instalar a integração Phosphor Icons para Vue.
- [x] Centralizar os ícones utilizados em src/icons.
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
- [x] Definir avaliação opcional com estrelas inteiras de 1 a 5 e comentário opcional de até 500 caracteres.
- [ ] Desenhar avaliação e comentário na tela de detalhes e edição, com acesso por toque, mouse e teclado.
- [x] Persistir e proteger avaliação e comentário por livro; validar entradas e tratar falhas ao salvar.
- [x] Testar salvamento, edição, ausência de comentário e regras de validação aprovadas.

### Avaliação e texto rico — decisões confirmadas

- [x] Avaliação opcional com estrelas inteiras de 1 a 5; comentário opcional de até 500 caracteres de texto visível.
- [ ] Projetar editor acessível e responsivo com negrito, emojis e diferentes níveis de título, com contador e indicação clara do limite.
- [ ] Escolher editor Vue mantido e verificar vulnerabilidades; definir e documentar contagem consistente de emojis e quebras de linha, sem contar marcação de formatação.
- [x] Validar limite e formato no cliente e no servidor; aceitar somente formatações aprovadas e renderizar com segurança.
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
- [ ] Validar os fluxos novos da API com autenticação Google e D1 reais antes de sua próxima publicação.

### Estante e sessão

- [x] Integrar login Google, saída, estados de acesso e token Firebase para chamadas à API.
- [x] Conectar dashboard e estante aos livros retornados pela API, agrupar séries, ordenar volumes e pesquisar.
- [x] Documentar variáveis públicas do Firebase Web e variáveis privadas da API, com exemplos vazios.
- [ ] Validar o login com uma conta real e os fluxos no celular após configurar Firebase e domínio autorizado.
- [x] Conectar cadastro, detalhes, filtros, capas automáticas e notificações dos fluxos de escrita no código local.
- [ ] Publicar e validar essas alterações; o envio manual de capas ainda não foi implementado.

- [x] Validar acesso local com conta Google real, UID autorizado e API local, conforme confirmação da proprietária.
- [ ] Validar separadamente o acesso após o deploy e em celular; o teste local não comprova o ambiente de produção.

### Configuração Cloudflare

- [x] Criar o D1 `biblioteca-virtual`, conectar o identificador no Wrangler e aplicar a migração inicial no banco remoto.
- [x] Preparar o banco local separado e a compilação da interface e API no mesmo Worker.
- [ ] Configurar os segredos do Worker e publicar a versão preparada quando autorizado.
- [ ] Adicionar o domínio publicado aos domínios autorizados do Firebase e validar o acesso em produção e no celular.
- [ ] Configurar variáveis públicas na compilação da Cloudflare se a publicação automática pelo GitHub for habilitada.

### Publicação inicial

- [x] Publicar o Worker inicial com a interface, D1 remoto e configurações privadas da API.
- [x] Confirmar que o site e a saúde da API respondem e que a rota privada rejeita requisições sem login.
- [ ] Adicionar o domínio do Worker ao Firebase e validar login e acesso à estante em produção e no celular.
- [ ] Configurar a compilação automática do GitHub e suas variáveis públicas se essa opção for adotada; a publicação inicial usou compilação local.

### Login em dispositivos com armazenamento particionado

- [x] Preparar login por redirecionamento no endereço HTTPS publicado e encaminhar os recursos de autenticação para o Firebase pelo mesmo domínio do site.
- [ ] Adicionar o endereço de retorno do site ao cliente OAuth Web no Google Cloud, publicar a correção e validar no dispositivo que apresentou o erro.
- [ ] Validar também a entrada no computador e a proteção das rotas privadas após a alteração.

- [x] Validar o login Google em produção no celular, após ajustar o cliente OAuth, conforme confirmação da proprietária.

### Versionamento e integração Cloudflare

- [x] Adotar versionamento semântico e exigir commit e tag da versão antes de novas publicações.
- [x] Conectar o repositório ao Worker existente, conforme confirmação da proprietária.
- [ ] Verificar no painel a configuração efetiva das compilações e garantir que versões não sejam publicadas automaticamente.
- [ ] Configurar as variáveis públicas `VITE_FIREBASE_*` para a compilação, sem expor segredos ou substituir os segredos existentes do Worker.
- [ ] Confirmar a primeira compilação da integração e registrar como promover uma versão identificada à produção.

- [x] Registrar que todas as modificações devem ter commits rastreáveis e que versões de publicação recebem tags semânticas.

### Cadastro manual — implementação

- [x] Formulário responsivo para título, autor, ISBN opcional, gêneros, série, volume, quantidade e status, com validação e salvamento na API protegida.
- [x] Informar ISBN duplicado e preservar os dados em caso de falha; atualizar estante e indicadores após salvar.
- [ ] Validar visualmente o cadastro, a consulta, a câmera e as capas em dispositivos e temas reais; envio manual de capas continua pendente.

### Consulta por ISBN

- [x] Consultar a Open Library pelo ISBN validado, permitir revisão e preenchimento manual e preservar a capa automática encontrada para livros com ISBN.
- [ ] Verificar visualmente e com serviços reais em celular e computador; a exibição de capas automáticas e a imagem padrão estão implementadas, mas o envio manual continua pendente.
- [ ] Avaliar integração adicional ao Google Books: sua documentação exige identificação para consultas públicas. A Open Library pode não encontrar todas as edições ou capas e está sujeita a disponibilidade e limites do serviço.

### Leitura pela câmera

- [x] Iniciar câmera somente por ação da usuária, reconhecer ISBN válido, consultar a fonte e permitir digitação alternativa; encerrar câmera ao cancelar, reconhecer ou sair.
- [x] Tratar indisponibilidade, recusa de permissão e interrupção, com testes de regras e liberação após cancelamento.
- [ ] Validar leitura e permissões em dispositivos e navegadores reais, inclusive iOS e Android, antes da publicação.
- Auditoria npm: sete alertas moderados ligados ao `minimatch` transitivo de ferramentas de desenvolvimento; nenhum alerta atribuído à biblioteca de leitura. A correção sugerida exige avaliação de compatibilidade, sem aplicação forçada.

### Preparação da versão 1.1.0

- [x] Identificar por versão semântica o cadastro manual, a consulta por ISBN e a leitura pela câmera.
- [ ] Validar os fluxos publicados em dispositivos reais. A integração Git ainda não foi confirmada: a consulta à configuração de builds retornou acesso negado; não enviar alterações ao repositório remoto até verificá-la.

### Preenchimento automático por ISBN

- [x] Ao digitar um ISBN válido, iniciar a consulta automaticamente após uma breve pausa; a leitura pela câmera continua iniciando a consulta imediatamente.
- [x] Preencher título e autores disponíveis, preservando alterações manuais e ignorando respostas de consultas antigas. A consulta pode ser repetida pelo botão e o preenchimento manual permanece disponível.

### Autoria na consulta por ISBN

- [x] Consultar os autores vinculados à edição quando a busca inicial não trouxer nomes; informar quando a fonte não disponibilizar autoria e manter o preenchimento manual.
- [ ] Validar com o ISBN específico que apresentou ausência de autor e em dispositivo real.

### Preferência por dados em português

- [x] Priorizar o título e a capa da edição correspondente ao ISBN e solicitar resultados em português à Open Library; usar os dados disponíveis quando a edição não trouxer esses campos.
- [ ] Validar com ISBNs brasileiros reais. A fonte não distingue necessariamente português do Brasil de outras variantes e pode não ter os dados da edição.

### Dados adicionais da edição

- [x] Limitar novos salvamentos a quatro gêneros e sugerir até quatro assuntos retornados pela edição, sempre editáveis; fontes externas podem fornecer assuntos em outros idiomas ou pouco precisos.
- [x] Permitir consultar e salvar editora e número de páginas opcionais, com preenchimento automático quando disponíveis; preservar alterações manuais e registros existentes.
- [x] Aplicar a migração `0002_book_metadata.sql` ao D1 remoto.
- [ ] Validar o cadastro em dispositivos reais. Livros existentes com mais de quatro gêneros são preservados, mas precisam ser ajustados a quatro para um novo salvamento.

### Detalhes, edição e exclusão

- [x] Abrir detalhes da edição a partir da estante, consultar os dados, editar pelo formulário e confirmar a exclusão antes de chamar a API protegida.
- [x] Preservar dados de edição em erros de salvamento, tratar conflito de ISBN e falhas de exclusão e atualizar os indicadores após alterações.
- [ ] Validar interações, foco, temas e responsividade em navegadores e dispositivos reais.

### Capas — decisões e progresso

- [x] Limite aprovado pela proprietária: 2 MB por imagem; formatos JPG, JPEG e PNG, somente para livros sem ISBN.
- [x] Escolher o Cloudflare R2 como armazenamento privado, sem ativar recursos pagos ou presumir uso ilimitado; sua ativação e configuração devem ser tratadas antes da publicação.
- [x] Exibir capas automáticas na estante e nos detalhes, com imagem padrão quando estiverem ausentes ou indisponíveis.
- [ ] Implementar e testar envio privado com validação de conteúdo e tamanho no servidor; associar ao livro sem ISBN e tratar exclusão e falhas.

### Avaliação e comentário — implementação

- [x] Permitir avaliação opcional de 1 a 5 estrelas inteiras e comentário pessoal editável em parágrafos, negrito e títulos de níveis 1 a 3.
- [x] Contar pontos de código Unicode (emojis compostos podem contar mais de um), quebras de linha e separações entre blocos como um cada; o limite é 500. Marcação não conta.
- [x] Validar estrutura e limite no servidor, armazenar somente blocos e marcas permitidos e renderizar como texto seguro; testar entradas maliciosas e persistência.
- [ ] Validar edição por toque e teclado, acessibilidade e temas em dispositivos reais.

### Acabamento da estante

- [x] Aplicar filtros combinados de gênero, status e série e ordenação por título, mantendo volumes ordenados; permitir limpar busca e filtros sem resultados.
- [x] Acrescentar notificações de sucesso e de falha no salvamento/exclusão, incluindo ISBN duplicado, além das mensagens persistentes; manter a página 404 e estados de carregamento e erro.
- [x] Respeitar a preferência de tema do dispositivo na primeira visita e permitir troca manual.
- [ ] Validar contraste, foco, notificações, temas e leiautes em celular e computador com navegadores reais; concluir também o envio manual de capas ainda pendente.

As combinações principais de texto, texto secundário e botões dos temas claro e escuro foram verificadas por cálculo de contraste e atingem pelo menos 4,5:1. Isso não substitui a inspeção dos componentes, foco, imagens e estados em telas reais.

### Evolução da experiência — proposta

- [x] Preparar [wireframes de estante, cadastro e detalhes](WIREFRAMES-EVOLUCAO.md) para celular e computador, incluindo estados essenciais.
- [ ] Validar com a proprietária a organização proposta e a confirmação ao descartar alterações; ajustar os wireframes conforme as decisões.
- [ ] Após validação dos wireframes, preparar e validar protótipo visual nos dois temas antes de implementar mudanças.

### Protótipo visual da evolução

- [x] Registrar aprovação dos wireframes e preparar [protótipo visual responsivo](PROTOTIPO-ESTANTE.html), com temas e dados fictícios.
- [x] Propor ícones acessíveis para fechar e sair e fechamento dos painéis ao clicar fora; preservar confirmação ao descartar formulário alterado.
- [x] Receber aprovação da proprietária para aplicar o protótipo. A validação prática dos dois temas e interações em dispositivos permanece pendente.

### Aplicação do protótipo

- [x] Registrar aprovação da proprietária e aplicar a organização da estante, filtros, cadastro e detalhes, com ícones de saída e fechamento.
- [x] Fechar painéis pelo fundo e confirmar descarte de alterações no formulário; manter bloqueio durante operações em andamento.
- [ ] Validar temas, foco, toque, fechamento e fluxos autenticados em navegadores e dispositivos reais antes de publicar.
- [x] Acrescentar movimento discreto aos painéis, à expansão de conteúdo e à interação com cartões e botões, respeitando a preferência por movimento reduzido.
- [x] Substituir a confirmação do navegador ao descartar edição por uma notificação persistente com opções de continuar editando ou descartar.
- [x] Reservar espaço para a prévia da capa junto ao título e autor e apresentar avaliação em uma única linha de estrelas douradas, com opção de limpar.
- [x] Apresentar gêneros como etiquetas destacadas no cadastro e nos detalhes, permitindo removê-los no formulário.
- [x] Esclarecer mensagens de consulta, validação, salvamento e exclusão, destacando os retornos de consulta e câmera junto à área correspondente.
- [x] Apresentar as opções do editor de comentário com ícones, nomes acessíveis e indicação da formatação ativa.
- [x] Evitar corte dos rótulos caso uma versão anterior do editor apareça durante a atualização da interface.
- [x] Manter a confirmação de descarte visível na parte inferior da tela ao percorrer o formulário, inclusive após a animação do painel.

### Preparação da versão 1.4.0

- [x] Identificar por versão semântica as melhorias da estante, do cadastro e das interações.
- [ ] Confirmar publicação, acesso e fluxos autenticados em dispositivos reais; verificar a configuração de compilações da integração Git com a Cloudflare.
- [x] Adicionar favicon com o símbolo da biblioteca e as cores da identidade visual.
- [x] Preparar ícones e metadados para atalhos na tela inicial de iPhone e Android, mantendo a abertura no navegador.
- [ ] Validar a adição do atalho e a aparência dos ícones em celulares reais após publicação.

### Preparação da versão 1.4.1

- [x] Identificar por versão semântica o favicon e os ícones para atalhos em celulares.
- [ ] Confirmar a publicação e validar os atalhos em iPhone e Android.

### Publicação da versão 1.3.0

- [x] Executar lint, verificação de tipos, 53 testes e compilação; criar commit e tag, aplicar a migração remota e publicar a versão identificada.
- [x] Verificar respostas do site e da saúde da API e confirmar bloqueio da coleção sem autenticação.
- [ ] Validar os novos fluxos autenticados em produção, em celular e computador. A integração Git da Cloudflare permanece sem verificação; não foi enviado novo código ao GitHub nesta publicação.

### Favoritos, formatos e páginas lidas

- [x] Registrar favoritos e indicar na estante e nos detalhes.
- [x] Registrar múltiplas opções de posse ou origem, inclusive empréstimo de pessoa ou assinatura, sem presumir dados em cadastros antigos.
- [x] Distinguir livro, quadrinho, mangá e outro; manter tipo opcional para edições já existentes.
- [x] Somar páginas informadas de edições concluídas uma vez por cadastro no paginômetro, sem multiplicar por exemplares.
- [ ] Validar os novos controles e o dashboard em dispositivos e temas reais. Antes de publicar, aplicar a migração `0003_collection_fields.sql` ao D1 remoto e identificar a versão.

### Opção única de leitura sem posse

- [x] Substituir as opções visíveis de empréstimo por “Não tenho”, preservando os registros anteriores até que a opção seja alterada.
- [x] Melhorar os estados selecionado e de foco dos controles de posse, favorito e avaliação.
- [ ] Validar visualmente os controles em dispositivos reais.

### Reorganização do cadastro

- [x] Preparar [wireframe de reorganização do cadastro](WIREFRAME-CADASTRO.md), incluindo os campos e comportamentos existentes.
- [x] Validar sequência, escolhas visíveis e seção de dados adicionais com a proprietária e preparar [protótipo visual](PROTOTIPO-CADASTRO.html).
- [x] Receber aprovação do protótipo e implementar a organização do cadastro com opções visíveis e seção expansível para dados da edição.
- [x] Exibir coração vazio ou preenchido para indicar e alterar o estado de favorito no cadastro.
- [x] Exibir coração para favoritos e estrelas para a avaliação na visualização de detalhes do livro.
- [x] Suavizar abertura e fechamento das séries, respeitando a preferência por movimento reduzido e preservando a navegação por teclado.
- [x] Suavizar a abertura dos painéis e a troca de tema, respeitando a preferência por movimento reduzido.
- [ ] Validar visualmente e por teclado os fluxos de cadastro e edição em ambos os temas, no celular e no computador, inclusive consulta e câmera reais.

### Contagem de exemplares próprios

- [x] Somar no indicador de exemplares apenas as quantidades de edições marcadas como físicas ou e-books que a proprietária possui; preservar indicadores de leitura e páginas lidas para empréstimos.
- [ ] Revisar a posse dos livros já cadastrados: registros sem essa informação ficam fora do total de exemplares até serem classificados.

### Contagem por edição possuída

- [x] Contar cada edição possuída uma vez, inclusive quando há físico e e-book ou mais de um exemplar físico; manter quantidade cadastrada para consulta.
- [ ] Revisar a posse dos cadastros existentes: sem essa informação, a edição não entra no indicador “Livros que tenho”.

### Leitor de ISBN — nova direção visual

- [x] Pesquisar o fluxo público do leitor do Skoob e preparar [esquema de câmera com linha central](WIREFRAME-CAMERA.md), inspirado na descrição da proprietária.
- [x] Validar o esquema com a proprietária e preparar o [protótipo visual da câmera](PROTOTIPO-CAMERA.html).
- [x] Validar o protótipo visual com a proprietária e implementar a linha central e a prévia ampliada no leitor.
- [ ] Testar leitura, cancelamento, permissões e apresentação em celular e computador após a implementação.
