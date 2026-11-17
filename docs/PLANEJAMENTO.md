# Biblioteca virtual — planejamento

## Atualização: cadastro em etapas

A proprietária escolheu a proposta “Passos suaves”: Livro, Organização e Leitura. É possível salvar após informar título e autor, mantendo ISBN opcional; os demais dados podem ser preenchidos depois. Na edição, as seções podem ser acessadas diretamente. Todos os dados informados continuam sujeitos à validação antes do salvamento, e o preenchimento é preservado ao navegar entre etapas.

## Atualização: dados ao escolher capa

Ao escolher uma capa na pesquisa, preencher título, autor, editora, páginas e gêneros disponíveis somente nos campos vazios. Se o cadastro tiver ISBN, preencher apenas quando o ISBN da edição encontrada coincidir; para uma edição diferente ou não comparável, aplicar somente a capa. Sem ISBN no cadastro, permitir o preenchimento dos campos vazios. Não alterar o ISBN nem sobrescrever dados já preenchidos. Esta decisão substitui a proposta anterior de que a escolha alteraria somente a capa.

## Objetivo

Criar uma biblioteca pessoal, agradável e fácil de usar no celular, para organizar livros, quantidades, sagas e gêneros. O acesso será por conta Google; não haverá página ou funcionalidade de perfil.

## Etapas e aprovação

1. Levantar requisitos e decidir o fluxo com a proprietária.
2. Criar wireframes das telas e validar o fluxo antes de avançar.
3. Criar um protótipo visual responsivo e validar a aparência e as interações.
4. Implementar, testar e preparar a publicação na Cloudflare.

Não fazer commits antes da validação explícita do fluxo. Nenhuma implementação ou protótipo deve ser tomada como aprovada por este planejamento.

## Proposta técnica inicial

- Interface: Vue.js e Tailwind CSS, com componentes reutilizáveis, foco em celular e temas claro/escuro.
- Hospedagem e API: Cloudflare Workers com arquivos estáticos e endpoints protegidos.
- Banco: Cloudflare D1 (SQLite); usar migrações versionadas. Firebase Authentication para login Google é uma opção; Firestore não é necessário nessa proposta.
- Acesso privado: verificar o token no servidor e autorizar somente a identidade Google permitida, definida em configuração segura. Estar autenticado com uma conta Google não é suficiente para acessar os dados. Não registrar a identidade autorizada no repositório.
- Catálogo: pesquisar por ISBN no Google Books e, como alternativa, Open Library; confirmar o resultado e permitir correção. Utilizar capas disponíveis nas fontes, respeitando condições de uso, com imagem padrão quando não houver capa. Nenhuma API garante encontrar toda edição ou capa.
- Leitura de ISBN: solicitar câmera apenas ao iniciar a leitura; oferecer digitação e busca por título como alternativas. Validar ISBN e testar suporte e permissões nos navegadores móveis escolhidos; usar biblioteca compatível quando necessário.
- Custos: manter serviços nos planos gratuitos e verificar limites e exigências de configuração na implantação. Ao atingir os limites, algumas operações podem ficar indisponíveis; não presumir gratuidade ilimitada nem ativar plano pago automaticamente.

São escolhas propostas, sujeitas às respostas e à validação de fluxo. A configuração de contas e a publicação serão tratadas nas etapas posteriores.

## Referências consultadas

- [Cloudflare D1: limites](https://developers.cloudflare.com/d1/platform/limits/) e [preços](https://developers.cloudflare.com/d1/platform/pricing/).
- [Cloudflare Workers: preços](https://developers.cloudflare.com/workers/platform/pricing/).
- [Firebase Authentication](https://firebase.google.com/docs/auth/) e [planos Firebase](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).
- [Google Books: volumes](https://developers.google.com/books/docs/v1/reference/volumes) e [Open Library: APIs de livros](https://openlibrary.org/dev/docs/api/books).

## Decisões pendentes

Ver perguntas e tarefas em [BACKLOG.md](BACKLOG.md). As respostas definem o escopo da primeira versão e o desenho das telas.

## Decisões confirmadas

- Controlar dados básicos, gênero, saga, quantidade e status de leitura.
- Cada edição tem cadastro próprio e sua quantidade de exemplares.
- Quando a consulta não encontrar o livro, permitir cadastro manual; quando não houver capa, usar uma capa padrão.
- Estilo aconchegante e delicado, com detalhes literários.
- Após entrar, apresentar a estante com busca e filtros.
- Restringir acesso exclusivamente à conta Google da proprietária, sem página de perfil.

O desenho inicial para validação está em [FLUXO-E-WIREFRAMES.md](FLUXO-E-WIREFRAMES.md). Os detalhes não decididos permanecem como propostas e não implicam aprovação do fluxo.

### Decisões adicionais confirmadas

- Status de leitura: não lido, lendo e lido.
- Um livro pode ter vários gêneros, e novos gêneros podem ser criados.
- Saga identificada pelo nome e número do volume em cada livro.
- ISBN já cadastrado: abrir a edição existente para ajustar a quantidade.
- Agrupar livros da mesma série na consulta da estante, preservando cadastros e quantidades por edição; ver proposta no fluxo.

### Atualização das decisões

- O status de leitura é individual por livro; tags: concluído, lendo e abandonado. Substitui a lista de status registrada anteriormente.
- Nome e autor são obrigatórios. ISBN é opcional: livros sem ISBN podem ser cadastrados manualmente e receber capa manual. A adição manual de capa é exclusiva para livros sem ISBN.
- ISBN duplicado: mostrar um toast avisando que o livro já está na biblioteca; não criar duplicata. Essa decisão substitui a proposta anterior de abrir a edição para ajuste da quantidade.
- Pendente: esclarecer como o status individual se relaciona com uma quantidade maior que um exemplar da mesma edição.

### Mini dashboard

- Ao entrar, exibir no topo da estante o total de livros, os concluídos/lidos, os em leitura e os abandonados. A estante permanece como tela inicial.
- Pendente: definir se o total soma exemplares ou conta cadastros de edições quando a quantidade for maior que um.

- Status de leitura é único por livro cadastrado (edição), independentemente da quantidade de exemplares. Os indicadores de status contam cada cadastro uma vez; ainda falta decidir se o total geral soma exemplares ou cadastros.

### Decisões mais recentes

- O total do dashboard soma exemplares: uma edição com quantidade 2 conta como 2. Os indicadores de leitura contam cada livro cadastrado uma vez.
- A estante inicia agrupada por série. Cada série aparece em um cartão quadrado com grade de até quatro miniaturas e nome, por exemplo “Série Trono de Vidro”; ao abrir, mostrar seus livros em ordem de volume. Livros sem série ficam visíveis individualmente.
- Acrescentar o status não lido aos status concluído, lendo e abandonado.
- Quando a consulta por ISBN não encontrar o livro ou a capa, permitir preencher os dados manualmente, mas manter capa padrão e não permitir envio manual de capa para livros com ISBN. Livros sem ISBN continuam podendo receber capa manual.

### Capas para livros sem ISBN

Selecionar imagem pela galeria ou pelos arquivos do dispositivo, aceitando apenas JPG, JPEG e PNG. Proposta para validação: limite de 5 MB por imagem, com aviso claro se excedido. A solução de armazenamento gratuita e seus limites serão escolhidos antes da implementação; validar o tipo e o tamanho também no servidor, sem confiar apenas na extensão ou no navegador.

- Ícones: Phosphor Icons, centralizados em uma pasta dedicada, com importação individual apenas do necessário.

## Direção visual escolhida

A proprietária escolheu a versão 3, “Lilás contemporâneo”: tema escuro com cartões modernos e seções destacadas. O tema claro também permanece no escopo. O conceito visual é uma referência; favoritos, telas extras ou qualquer outra funcionalidade ilustrativa não passam a integrar o projeto sem aprovação. As séries devem usar cartões com grade de até quatro miniaturas, conforme o fluxo definido.

### Uso no computador e anotações

- O site deve ser responsivo para celular e computador. Em telas maiores, aproveitar o espaço para mostrar a estante, filtros, séries e detalhes de forma confortável, sem apenas ampliar a tela do celular.
- Prever anotações associadas a livros, com edição confortável no computador e acesso também no celular. O formato e os detalhes das anotações ainda serão definidos com a proprietária; não presumir funcionalidades além de registrar e editar anotações.

### Avaliação e comentário pessoal

Cada livro poderá ter uma avaliação de até cinco estrelas e um breve comentário pessoal opcional sobre a leitura. Esses dados ficam associados ao livro cadastrado e devem poder ser consultados e editados no celular e no computador. O comentário pessoal atende à necessidade de anotações mencionada; recursos adicionais de anotação não estão definidos.

### Regras confirmadas para avaliação e comentário

- Avaliação opcional, em estrelas inteiras de 1 a 5; permitir deixar sem avaliação.
- Comentário opcional de até 500 caracteres de texto visível, com editor de texto rico: negrito, emojis e diferentes níveis de título. A contagem não deve incluir a marcação de formatação; definir e apresentar uma regra consistente para emojis e quebras de linha.
- Escolher um editor compatível com Vue e teclado/toque, com versão mantida e verificada. Definir uma lista explícita de formatações permitidas e validar e sanitizar conteúdo no servidor, antes de armazenar e ao renderizar conforme necessário; nunca executar scripts ou HTML arbitrário. Testar conteúdos maliciosos e preservação da formatação válida.

## Estado atual da implementação

A migração inicial de banco e os módulos de ISBN, contagem e verificação de identidade têm testes locais. A autenticação ainda não está integrada a uma API, e a migração ainda não foi aplicada ao D1: a tela atual continua sendo uma prévia sem persistência. A identidade permitida será configurada no servidor, sem dados reais no repositório.

## Progresso do D1 local

O projeto tem configuração de Worker e D1 local e a migração inicial foi aplicada no ambiente de desenvolvimento. A API disponibiliza apenas uma verificação de conexão sem dados da biblioteca; a autenticação e os endpoints privados seguem pendentes de integração. O identificador do banco no arquivo de configuração é fictício e não representa um banco remoto.

## Proteção atual da API

As rotas privadas da API verificam o token Firebase e restringem o acesso à identidade Google configurada; o endpoint de saúde não retorna dados pessoais. Existe uma rota de confirmação de sessão, mas ainda não há login na interface nem endpoints de livros. A verificação atual não consulta revogação antecipada dos tokens.

## Progresso da API de livros

A API privada agora oferece operações de livros com nome, autor, ISBN, quantidade, status, série e gêneros. A interface continua em prévia; capas, avaliação, comentário rico e integração com serviços externos permanecem pendentes. Os testes de operações usam SQLite isolado e autenticação simulada; a integração com conta Firebase e D1 remoto precisa ser validada posteriormente.

## Progresso da estante

A interface integra autenticação Firebase Google e consulta os livros autorizados para compor o dashboard e a estante agrupada. A configuração do projeto Firebase e a validação com uma conta real ainda são necessárias. Capas e interface de cadastro permanecem pendentes.

O primeiro acesso local com a conta Google autorizada foi confirmado pela proprietária. A implantação e a validação em produção e no celular continuam pendentes.

## Cloudflare

O banco D1 `biblioteca-virtual` foi criado na conta Cloudflare e recebeu a migração inicial. O Worker está configurado para servir a interface e encaminhar `/api/*` para a API. A cópia local do banco é independente do banco remoto. A publicação e a configuração de segredos do Worker ainda estão pendentes.

### Publicação inicial

O Worker foi publicado com os segredos da API e o D1 remoto. O site e o endpoint de saúde foram verificados, assim como o bloqueio de acesso anônimo à coleção. O domínio precisa ser autorizado no Firebase antes do teste completo do login. A implantação atual foi feita a partir de uma compilação local, sem integração automática do GitHub.

O funcionamento do login no celular em produção foi confirmado pela proprietária após ajustar o endereço de retorno no cliente OAuth. A correção publicada ainda precisa ser registrada em commit quando solicitado.

### Contagem do comentário pessoal

O limite de 500 usa pontos de código Unicode: um emoji simples conta como um, mas emojis compostos podem contar mais de um. Cada quebra de linha e cada separação entre blocos contam como um; a marcação não é contada. São aceitos parágrafos, quebras de linha, negrito e títulos de níveis 1 a 3. A mesma regra é aplicada no navegador e no servidor.

### Favoritos, posse, tipo e paginômetro

- O favorito é opcional e pode ser marcado ou removido no cadastro e na edição.
- É possível combinar posse física, e-book e a opção única “Não tenho” (por exemplo, leitura por empréstimo ou assinatura); não selecionar opções indica que a informação não foi registrada. Registros anteriores de empréstimo preservam seus dados e aparecem sob essa opção.
- Tipos disponíveis: livro, quadrinho, mangá e outro; cadastros anteriores não recebem tipo presumido.
- O paginômetro soma o número de páginas das edições concluídas, uma vez por cadastro, independentemente da quantidade. Edições sem número de páginas não contribuem para o total.

### Contagem de exemplares próprios

O total de exemplares do dashboard considera apenas edições marcadas como “Tenho físico” ou “Tenho e-book”, somando a quantidade informada para os exemplares que a proprietária possui. Leituras sem posse e cadastros sem informação de posse não entram nesse total. Os indicadores de leitura e o paginômetro continuam considerando as edições independentemente da posse. Essa decisão substitui regras anteriores sobre a contagem geral.

### Contagem de livros que possuo

Cada edição cadastrada que a proprietária possui conta uma única vez no indicador “Livros que tenho”, mesmo que esteja nos formatos físico e e-book ou tenha mais de um exemplar físico. A quantidade registrada continua disponível para consulta, mas não multiplica o indicador. Obras sem posse e sem informação de posse não são contadas; os indicadores de leitura e o paginômetro permanecem independentes da posse. Esta decisão substitui as regras anteriores para o total.
