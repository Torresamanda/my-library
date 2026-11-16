# Cadastro de livro — proposta de reorganização

**Para validação.** Este wireframe propõe organização e controles para cadastro e edição; não representa a aparência final. A interface e os dados existentes não foram alterados. O painel continua lateral no computador e ocupa a tela no celular.

## Fluxo proposto

1. Informar ou ler o ISBN, ou simplesmente começar pelos campos de título e autor.
2. Conferir capa, título e autor. A consulta por ISBN continua automática após digitação válida, com ação para repetir e alternativa manual.
3. Organizar a edição e a coleção com escolhas visíveis. Dados adicionais permanecem opcionais.
4. Se desejar, registrar status, favorito, avaliação e comentário; salvar no mesmo formulário.

Não há etapas obrigatórias nem navegação entre telas. Os blocos opcionais não escondem dados preenchidos sem indicar que existem.

## Celular

```text
┌──────────────────────────────────┐
│ Adicionar livro              [×] │
│ Organize uma edição na sua       │
│ biblioteca. * Obrigatório        │
│                                  │
│ ENCONTRE SEU LIVRO               │
│ ISBN (opcional)                  │
│ [ Digite o ISBN                ] │
│ [ Consultar ] [ Ler com câmera ] │
│ Sem ISBN? Preencha abaixo.       │
│ [Mensagem da consulta, se houver]│
│                                  │
│ SOBRE O LIVRO                    │
│ [ CAPA ]  Título *               │
│ [      ]  [                    ] │
│ [      ]  Autor *                │
│           [                    ] │
│                                  │
│ Tipo de obra (opcional)          │
│ ( ) Livro     ( ) Quadrinho      │
│ ( ) Mangá     ( ) Outro          │
│ [ Limpar tipo ]                  │
│                                  │
│ Gêneros (até 4)                  │
│ [ Fantasia, Romance            ] │
│ [ Fantasia × ] [ Romance × ]     │
│                                  │
│ Mais dados da edição          ▾  │
│ Editora · Páginas · Série/volume │
│                                  │
│ NA MINHA BIBLIOTECA              │
│ Formato ou origem (opcional)     │
│ [ ] Tenho físico [ ] Tenho e-book│
│ [ ] Não tenho                    │
│ Quantidade de exemplares [ 1 ]   │
│                                  │
│ MINHA LEITURA                    │
│ Status                           │
│ (•) Não lido    ( ) Lendo        │
│ ( ) Concluído   ( ) Abandonado   │
│ [ ] Marcar como favorito         │
│ ★ ★ ★ ★ ★   Limpar avaliação    │
│ Comentário opcional              │
│ [ ferramentas de formatação ]    │
│ [                              ] │
│ 0 de 500 caracteres              │
│                                  │
│ [ Salvar livro ] [ Cancelar ]    │
└──────────────────────────────────┘
```

As opções de tipo e status são grupos de escolha única, com aparência de botões e controles acessíveis por teclado. O tipo pode voltar a “não informado”; o status mantém “não lido” como padrão. Formato/origem admite múltiplas escolhas conforme as regras existentes, incluindo “não tenho” com seus comportamentos atuais. O texto de cada opção continua visível: cor e ícone não são os únicos indicadores.

### Mais dados da edição — expandido

```text
┌──────────────────────────────────┐
│ Mais dados da edição          ▴  │
│ Editora (opcional) [           ] │
│ Páginas (opcional) [           ] │
│ Série (opcional)   [           ] │
│ Volume (opcional)  [           ] │
└──────────────────────────────────┘
```

Na edição de livro, abrir automaticamente essa seção quando houver algum desses dados. Em novo cadastro, se a consulta preencher editora ou páginas, abrir a seção para permitir revisão. Caso esteja recolhida com dados, mostrar um resumo ou indicação de preenchimento. Se o volume for informado sem série, abrir a seção e apresentar o erro junto ao campo. As escolhas exatas de aparência e animação serão apresentadas no protótipo.

## Computador

```text
┌────────────────────────────────────────────────────────────────┐
│ Adicionar livro                                            [×] │
│ ENCONTRE SEU LIVRO                                             │
│ ISBN [                       ] [Consultar] [Ler com câmera]    │
│                                                                │
│ SOBRE O LIVRO                                                  │
│ [ CAPA ]   Título * [                                      ]   │
│ [      ]   Autor *  [                                      ]   │
│ Tipo: ( ) Livro  ( ) Quadrinho  ( ) Mangá  ( ) Outro [Limpar] │
│ Gêneros [                                ] [Fantasia ×]        │
│ Mais dados da edição ▾                                         │
│                                                                │
│ NA MINHA BIBLIOTECA                                            │
│ [ ] Tenho físico  [ ] Tenho e-book  [ ] Não tenho              │
│ Quantidade [ 1 ]                                               │
│                                                                │
│ MINHA LEITURA                                                  │
│ (•) Não lido  ( ) Lendo  ( ) Concluído  ( ) Abandonado        │
│ [ ] Favorito     ★ ★ ★ ★ ★                                     │
│ Comentário e ferramentas de formatação                          │
│                                                                │
│ [ Salvar livro ] [ Cancelar ]                                  │
└────────────────────────────────────────────────────────────────┘
```

## Comportamentos preservados

- Nome e autor são obrigatórios; ISBN é opcional. A câmera só inicia por ação da pessoa e continua oferecendo alternativa por digitação.
- Consultas não sobrescrevem alterações manuais; capa automática ou padrão permanece no lugar reservado. Envio manual de capa ainda não está disponível e não deve ser apresentado como funcional.
- Gêneros continuam editáveis, com até quatro ao salvar. Série e volume, editora, páginas, tipo de obra, formato/origem, quantidade, favorito, status, avaliação e comentário mantêm suas regras e valores existentes.
- Avaliação opcional de 1 a 5 estrelas inteiras, com ação para limpar; comentário opcional de até 500 pontos de código, com as formatações já permitidas.
- Erros aparecem junto ao contexto quando possível; falhas preservam os dados. Fechar, clicar fora ou cancelar com alterações solicita confirmação. O salvamento continua disponível apenas quando aplicável.
- A versão para teclado preserva foco visível, nomes acessíveis, grupos de opções e navegação natural; verificar contraste e toque em ambos os temas.

## Decisões para validação

1. A sequência “encontrar → dados do livro → biblioteca → leitura” está natural?
2. Prefere tipo de obra e status como escolhas visíveis em vez de listas suspensas?
3. Concorda em recolher editora, páginas, série e volume, abrindo automaticamente quando houver dados?

Após a validação deste fluxo, preparar o protótipo visual nos temas claro e escuro e submetê-lo à validação antes de alterar o formulário real.
