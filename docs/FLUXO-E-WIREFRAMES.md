# Fluxo e wireframes — proposta para validação

Estas telas são esquemas de organização e navegação, não representam o desenho visual final. O protótipo virá depois da validação do fluxo.

## Fluxo principal

1. Abrir o site → entrar com Google → o servidor valida a sessão e autoriza apenas a conta configurada.
2. Abrir a estante com mini dashboard → consultar os totais, pesquisar ou filtrar → selecionar uma edição para ver seus detalhes.
3. Adicionar livro → ler o ISBN com a câmera ou digitá-lo → consultar fontes → revisar os dados → informar gênero, saga, quantidade e status → salvar → retornar à estante.
4. Não encontrou o livro ou não há ISBN → iniciar cadastro manual. Para um livro sem ISBN, permitir selecionar uma capa na galeria ou nos arquivos do dispositivo; aceitar apenas JPG, JPEG ou PNG. Proposta: até 5 MB por imagem, sujeita à validação. Sem capa disponível, exibir capa padrão.
5. Abrir detalhes → editar os dados ou excluir, com confirmação.

Se o ISBN já estiver cadastrado, mostrar um toast informando que o livro já está na biblioteca e impedir o cadastro duplicado. Uma edição diferente tem seu próprio cadastro e quantidade.

## Entrada e acesso

```text
┌────────────────────────────┐
│       Minha biblioteca     │
│     Seu cantinho de livros │
│                            │
│      [ Entrar com Google ] │
└────────────────────────────┘
```

Conta diferente da autorizada: informar que o acesso é restrito e oferecer troca de conta. Não existe tela de perfil.

## Estante — tela inicial

```text
┌────────────────────────────┐
│ Minha biblioteca     ☼  ⋮  │
│ [Total] [Lidos]            │
│ [Lendo] [Abandonados]      │
│ [ Buscar livro ou autor  ] │
│ [ Gênero ▾ ] [ Status ▾ ]  │
│ [ Saga ▾   ] [ Ordenar ▾ ] │
│                            │
│ ┌─────────┐  ┌─────────┐  │
│ │  CAPA   │  │  CAPA   │  │
│ │ Título  │  │ Título  │  │
│ │ Autor   │  │ Autor   │  │
│ └─────────┘  └─────────┘  │
│                            │
│          [ + Adicionar ]   │
└────────────────────────────┘
```

O menu pode conter sair; o controle de tema troca entre claro e escuro. Em coleção vazia, apresentar convite para adicionar o primeiro livro. Sem resultados, oferecer limpeza dos filtros. Filtros e ordenação são propostas de interação.

## Adicionar livro

```text
┌────────────────────────────┐
│ ‹     Adicionar livro      │
│                            │
│ [ 📷 Ler código de barras ] │
│                            │
│ ISBN                       │
│ [ Digite o ISBN          ] │
│ [      Buscar livro      ] │
│                            │
│ [ Cadastrar manualmente  ] │
└────────────────────────────┘
```

A câmera só é solicitada ao escolher a leitura; oferecer retorno e digitação caso seja negada ou indisponível. Validar ISBN antes de consultar. Caso a consulta falhe ou não encontre, informar e oferecer nova tentativa ou cadastro manual.

## Conferir e salvar

```text
┌────────────────────────────┐
│ ‹     Conferir livro       │
│ [CAPA ou capa padrão]      │
│ Título  [                ] │
│ Autor   [                ] │
│ ISBN    [                ] │
│ Capa manual (sem ISBN) [+] │
│ Gêneros [ selecionar / + ] │
│ Saga    [               ▾] │
│ Volume  [                ] │
│ Quantidade [  −  1  +   ] │
│ Status  [               ▾] │
│                            │
│ [       Salvar livro     ] │
└────────────────────────────┘
```

O formulário manual aproveita a mesma tela, com campos vazios. Os dados obtidos automaticamente podem ser corrigidos antes de salvar. O livro pode ter vários gêneros, inclusive criados pela proprietária. A saga é identificada pelo nome e pelo número do volume. Os status são: não lido, concluído, lendo e abandonado. Cada livro cadastrado tem um único status, mesmo quando a quantidade de exemplares for maior que um. Nome e autor são obrigatórios; ISBN é opcional. Apenas livros sem ISBN podem receber uma capa adicionada manualmente.

## Detalhes da edição

```text
┌────────────────────────────┐
│ ‹       Detalhes       ⋮   │
│         [ CAPA ]           │
│ Título                     │
│ Autor                      │
│ Gênero · Saga              │
│ Status de leitura          │
│ Quantidade · ISBN          │
│                            │
│ [ Editar ]  [ Excluir ]    │
└────────────────────────────┘
```

A exclusão exige confirmação e remove o cadastro da edição e sua quantidade; o comportamento de sagas e gêneros vinculados será definido no modelo de dados.

## Estados que precisam existir

- Carregamento e erro ao consultar ou salvar, com opção de tentar novamente sem perder os dados digitados.
- Sessão expirada, sem rede, permissão de câmera negada e acesso não autorizado.
- Capa inexistente ou indisponível, com imagem padrão.
- Edição já cadastrada e estante ou busca sem resultados.

## Pontos pendentes

- Validar o limite proposto de 5 MB por imagem e definir o armazenamento gratuito na implementação.
- Se a consulta por ISBN não encontrar o livro, permitir preencher os dados manualmente; usar capa padrão se não houver capa e não oferecer envio manual para livros com ISBN.
- Se a sugestão para ISBN duplicado deve abrir a edição existente ou oferecer outro comportamento.

## Agrupamento por série — proposta

Na estante inicial, apresentar os livros agrupados por série (ou saga). Cada série aparece como um cartão quadrado com uma grade de até quatro miniaturas e um título como “Série Trono de Vidro”; ao tocar, abrir seus livros ordenados pelo número do volume. Livros sem série continuam visíveis individualmente. Cada edição permanece independente, com sua própria quantidade e detalhes.

```text
┌────────────────────────────┐
│ Minha biblioteca           │
│ [ Buscar livro ou autor  ] │
│ [ Filtros ]                │
│                            │
│ ┌─────────────┐            │
│ │ capa │ capa │            │
│ │ capa │ capa │            │
│ └─────────────┘            │
│ Série Trono de Vidro       │
│                            │
│ Livros sem série           │
│ ┌────────┐                 │
│ │ CAPA   │                 │
│ └────────┘                 │
│          [ + Adicionar ]   │
└────────────────────────────┘
```

A busca e os filtros devem continuar funcionando com o agrupamento ativo; grupos sem resultados ficam ocultos. Se várias edições corresponderem ao mesmo volume, apresentar cada uma separadamente. A composição do cartão quando houver menos ou mais de quatro capas será detalhada no protótipo.

## Mini dashboard na entrada

A estante continua sendo a tela inicial. Antes da busca e dos filtros, apresentar quatro indicadores compactos: total de livros na estante, concluídos (lidos), lendo e abandonados. Em uma biblioteca vazia, mostrar zero. Atualizar os indicadores após adicionar, editar ou excluir um livro. O total soma todos os exemplares: uma edição com quantidade 2 contribui com 2. Os indicadores de status contam cada livro cadastrado uma vez, independentemente da quantidade de exemplares.

## Erros e notificações

- Usar uma biblioteca de notificações compatível com Vue, mantida e sem vulnerabilidades conhecidas na versão escolhida; a escolha será verificada durante a implementação.
- Mostrar notificações claras para carregamento, criação, edição, exclusão e erros, incluindo o aviso de ISBN duplicado. Quando adequado, atualizar a mesma notificação de carregamento para sucesso ou erro.
- Apresentar erros também junto ao campo ou à área afetada quando for necessário explicar como corrigir ou tentar novamente; não depender apenas de avisos temporários.
- Criar página 404 para endereços inexistentes, com mensagem compreensível e ação para voltar à estante. Tratar falhas de sessão, rede, busca, câmera, imagem e gravação sem perder os dados preenchidos quando possível.
- Garantir que as mensagens sejam acessíveis e não revelem detalhes técnicos ou dados sensíveis.

## Uso no computador e anotações

A interface terá uma versão adaptada para computador, com dashboard, busca, filtros e estante organizados para telas maiores, além de navegação confortável por mouse e teclado. O fluxo de detalhes do livro incluirá acesso às anotações; seu formato e comportamento serão definidos antes da implementação. A experiência para celular continuará disponível.

## Avaliação e comentário

Nos detalhes do livro, apresentar avaliação de até cinco estrelas e um campo breve e opcional para registrar o que a proprietária achou da leitura. Permitir consultar e editar essas informações no celular e no computador. As regras de preenchimento da avaliação, como obrigatoriedade e frações de estrela, ainda serão confirmadas.

### Regras do comentário formatado

A avaliação é opcional e usa estrelas inteiras de 1 a 5. O comentário é opcional e aceita até 500 caracteres de texto visível, com negrito, emojis e diferentes níveis de título. O editor deve funcionar no celular e no computador e mostrar a contagem restante; os detalhes de contagem de emojis e quebras de linha serão definidos de forma consistente.
