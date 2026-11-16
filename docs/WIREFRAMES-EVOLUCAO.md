# Evolução da biblioteca — wireframes para validação

**Situação: proposta, aguardando validação da proprietária.** Estes esquemas mostram organização e fluxo, não cores, tipografia ou aparência final. Os nomes e números são exemplos fictícios. A implementação existente não foi alterada.

## 1. Estante no celular

```text
┌──────────────────────────────────┐
│ Minha biblioteca       [tema] Sair│
│ Seu cantinho de leituras         │
│                                  │
│ RESUMO                           │
│ Exemplares  12  │ Lidos       4  │
│ Lendo        2  │ Abandonados 1  │
│ Exemplares somam as quantidades; │
│ os status contam edições.        │
│                                  │
│ [ Buscar título, autor...      ] │
│ [ + Adicionar livro            ] │
│ [ Filtros (2) ▾ ] [ Ordenar ▾ ] │
│ Gênero: Fantasia ×  Lendo ×      │
│ 3 resultados     Limpar filtros │
│                                  │
│ MINHAS SÉRIES                    │
│ ┌────────┬────────┐              │
│ │ CAPA 1 │ CAPA 2 │  Série Aurora│
│ ├────────┼────────┤  2 edições   │
│ │        │        │  Abrir série │
│ └────────┴────────┘              │
│                                  │
│ LIVROS SEM SÉRIE                 │
│ ┌────────────┐ ┌────────────┐   │
│ │    CAPA    │ │    CAPA    │   │
│ │            │ │            │   │
│ ├────────────┤ ├────────────┤   │
│ │ Título     │ │ Título     │   │
│ │ Autoria    │ │ Autoria    │   │
│ │ [Lendo]    │ │ [Não lido] │   │
│ └────────────┘ └────────────┘   │
└──────────────────────────────────┘
```

- **Filtros fechado:** mostra a quantidade ativa; ao abrir, apresenta gênero, status e série. Ordenação fica separada. Os valores continuam combináveis.
- Etiquetas removem filtros individualmente; “Limpar filtros” limpa busca e filtros, com texto ajustado para deixar isso explícito na versão final. A contagem representa edições correspondentes, inclusive dentro das séries.
- Tocar em uma série expande seus volumes em ordem; tocar em um livro abre detalhes. A área de seleção deve ser confortável para toque e teclado.
- O resumo permanece antes da busca, conforme o fluxo aprovado. A frase explicativa é uma proposta de apresentação, não uma mudança na regra de contagem.

### Série expandida

```text
┌──────────────────────────────────┐
│ [Grade de até 4 capas]           │
│ Série Aurora · 2 edições   Fechar│
├──────────────────────────────────┤
│ [CAPA]  Volume 1 · Título        │
│         Autoria          [Lido]  │
│ [CAPA]  Volume 2 · Título        │
│         Autoria          [Lendo] │
└──────────────────────────────────┘
```

Cada edição permanece independente; edições do mesmo volume aparecem separadamente. Ao filtrar, aparecem somente os livros correspondentes.

## 2. Estante no computador

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Minha biblioteca                                      [tema]  [Sair]   │
│ Seu cantinho de leituras                                               │
│                                                                         │
│ [Exemplares 12]  [Lidos 4]  [Lendo 2]  [Abandonados 1]                │
│ Exemplares somam quantidades; status contam edições.                    │
│                                                                         │
│ [ Buscar título, autor, gênero ou série              ] [+ Adicionar]   │
│ [Gênero ▾] [Status ▾] [Série ▾]               [Ordenar por título ▾]   │
│ Fantasia ×  Lendo ×                 3 resultados  Limpar busca e filtros│
│                                                                         │
│ MINHAS SÉRIES                                                          │
│ ┌─────────────────────┐  ┌─────────────────────┐                       │
│ │ [grade de 4 capas]  │  │ [grade de 4 capas]  │                       │
│ │ Série Aurora        │  │ Série Horizonte     │                       │
│ │ 2 edições · Abrir   │  │ 4 edições · Abrir   │                       │
│ └─────────────────────┘  └─────────────────────┘                       │
│ LIVROS SEM SÉRIE                                                       │
│ [ CAPA / título / autor ] [ CAPA / título / autor ] [ CAPA / título ] │
└─────────────────────────────────────────────────────────────────────────┘
```

No computador, filtros ficam diretamente visíveis e o espaço adicional acomoda mais cartões. A quantidade de colunas é adaptável; não depende de um número fixo.

## 3. Cadastro e edição

O painel lateral continua sobre a estante no computador e ocupa a largura disponível no celular. Os blocos abaixo são seções de um único formulário, não etapas obrigatórias.

```text
┌──────────────────────────────────┐
│ Adicionar livro              [×] │
│ * Campos obrigatórios            │
│                                  │
│ IDENTIFICAÇÃO                    │
│ ISBN (opcional)                  │
│ [                            ]   │
│ [ Ler com câmera ] [ Consultar ] │
│ A consulta também inicia após   │
│ digitar um ISBN válido.          │
│ [Estado da consulta / capa]      │
│ Título *  [                  ]   │
│ Autor *   [                  ]   │
│                                  │
│ SOBRE A EDIÇÃO                   │
│ Editora   [                  ]   │
│ Páginas   [                  ]   │
│ Gêneros   [ até 4            ]   │
│                                  │
│ ORGANIZAÇÃO                      │
│ Série     [                  ]   │
│ Volume    [                  ]   │
│ Quantidade [  1  ]               │
│ Status     [ Não lido       ▾]   │
│                                  │
│ SUA LEITURA                      │
│ Avaliação opcional  [1–5 / sem] │
│ Comentário opcional              │
│ [ negrito | títulos          ]   │
│ [                            ]   │
│ 0 / 500                         │
│                                  │
│ [ Salvar livro ] [ Cancelar ]    │
└──────────────────────────────────┘
```

- Consulta, câmera e preenchimento manual continuam alternativos. A câmera só é iniciada por ação explícita. Dados encontrados são revisáveis e alterações manuais são preservadas.
- Quando não houver ISBN, o espaço de capa poderá oferecer envio manual de JPG, JPEG ou PNG de até 2 MB; **esse envio ainda não está implementado**. Com ISBN, usar capa automática ou padrão, sem envio manual.
- Quando a consulta falhar ou não encontrar dados, mostrar mensagem junto à consulta e manter preenchimento manual e nova tentativa. ISBN duplicado impede o salvamento e informa o problema sem apagar os dados.
- Avaliação aceita estrelas inteiras de 1 a 5 ou nenhuma. Comentário aceita até 500 pontos de código, conforme a regra documentada, com parágrafos, negrito e títulos de níveis 1 a 3. Mostrar explicação acessível da contagem.
- Ao fechar ou cancelar com alterações, **proposta a validar:** pedir confirmação antes de descartar o preenchimento. Em caso de falha ao salvar, manter os dados e oferecer nova tentativa.

## 4. Detalhes da edição

```text
┌──────────────────────────────────┐
│ Detalhes do livro            [×] │
│ [ CAPA ]  Título                 │
│           Autoria                │
│           [Lendo]                │
│                                  │
│ EDIÇÃO                           │
│ ISBN · Editora · Páginas         │
│                                  │
│ ORGANIZAÇÃO                      │
│ Gêneros · Série e volume         │
│ Quantidade de exemplares         │
│                                  │
│ SUA LEITURA                      │
│ Avaliação: 4 de 5 estrelas       │
│ Comentário pessoal               │
│                                  │
│ [ Editar livro ] [ Excluir ]     │
└──────────────────────────────────┘
```

No computador, a capa e as informações principais ficam lado a lado; no celular podem empilhar se necessário. Dados ausentes são identificados de forma clara. Excluir continua exigindo confirmação explícita e esclarece que a edição e seus exemplares serão removidos.

## 5. Estados essenciais

```text
ESTANTE VAZIA                    SEM RESULTADOS
Sua estante está vazia           Nenhum livro encontrado
Adicione seu primeiro livro.     Revise a busca ou os filtros.
[ + Adicionar livro ]            [ Limpar busca e filtros ]

ERRO AO CARREGAR                 ERRO AO SALVAR
Não foi possível carregar.       Não foi possível salvar.
[ Tentar novamente ]              Seus dados continuam aqui.
                                 [ Tentar novamente ]
```

Também preservar estados de carregamento, sessão e acesso, câmera negada ou indisponível, capa ausente, confirmação de exclusão e sucesso. Mensagens importantes devem permanecer junto ao contexto, sem depender apenas de notificações temporárias.

## Pontos para validação

1. A organização da estante e o tamanho proposto para as capas agradam no celular e no computador?
2. No celular, prefere filtros recolhidos e indicadores compactos como proposto?
3. Os grupos do cadastro e dos detalhes estão claros? Há alguma informação que deva aparecer mais cedo?
4. A confirmação antes de descartar um formulário alterado é desejada?

Após a validação, detalhar o protótipo visual nos temas claro e escuro e validar aparência e interações antes de implementar. Estes wireframes não aprovam novas funcionalidades automaticamente.
