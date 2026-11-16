# Pesquisa de capas — proposta visual para validação

**Situação: aguardando validação.** Este wireframe reorganiza a pesquisa já planejada e implementada no projeto. Nomes e resultados abaixo são fictícios; não representam uma consulta real. A pesquisa com o serviço real ainda depende de configuração e validação.

## Fluxo

1. No cadastro ou na edição, selecionar **Pesquisar capa** junto à prévia.
2. Conferir título e autor preenchidos a partir do formulário; ambos podem ser alterados para a busca, sem alterar os dados do livro.
3. Pesquisar e comparar os resultados, preservando a ordem da fonte. Cada cartão mostra a capa e os dados de edição disponíveis.
4. Selecionar um cartão com capa. A seleção fica visível e habilita **Usar esta capa**.
5. Confirmar para voltar ao formulário com a capa escolhida. Ela só será persistida ao salvar o livro. Cancelar mantém a capa anterior.

## Celular

```text
┌──────────────────────────────────┐
│ Escolher capa                [×] │
│ Pesquise e confira a edição.     │
│                                  │
│ Título [_______________________] │
│ Autor  [_______________________] │
│ [ Pesquisar                    ] │
│                                  │
│ Resultados · Google Books        │
│ [atribuição oficial do Google]   │
│                                  │
│ ┌────────────┐ ┌────────────┐   │
│ │            │ │            │   │
│ │    CAPA    │ │    CAPA    │   │
│ │            │ │            │   │
│ ├────────────┤ ├────────────┤   │
│ │ Título     │ │ Título     │   │
│ │ Autor      │ │ Autor      │   │
│ │ Editora    │ │ Editora    │   │
│ │ Mesmo ISBN │ │ Outra edição│  │
│ │ Ver fonte ↗│ │ Ver fonte ↗│   │
│ └────────────┘ └────────────┘   │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ✓ Capa selecionada           │ │
│ │ Outra edição: somente a capa │ │
│ │ será alterada no formulário. │ │
│ └──────────────────────────────┘ │
│ [ Usar esta capa              ] │
│ [ Cancelar pesquisa          ] │
└──────────────────────────────────┘
```

- Os cartões são opções de escolha única, com área de toque ampla, foco visível e indicação textual e visual da seleção. O link para a fonte é uma ação separada, fora do controle de seleção, para evitar controles interativos aninhados.
- O botão de confirmação deve permanecer fácil de alcançar ao rolar, sem cobrir resultados ou mensagens e respeitando a área segura do celular. A solução exata será avaliada no protótipo.
- Se uma edição não tiver imagem, mostrar “Sem capa” e os dados disponíveis, sem permitir selecioná-la como capa. A ação para consultar a fonte continua disponível.

## Computador

```text
┌────────────────────────────────────────────────────────────────────┐
│ Escolher capa                                                  [×] │
│ Pesquise pelo título e autor e confira a edição.                   │
│ Título [____________________] Autor [____________________] [Buscar]│
│                                                                    │
│ Resultados do Google Books                    [atribuição oficial] │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐                    │
│ │    CAPA    │  │    CAPA    │  │    CAPA    │                    │
│ │            │  │            │  │            │                    │
│ │ Título     │  │ Título     │  │ Título     │                    │
│ │ Autor      │  │ Autor      │  │ Autor      │                    │
│ │ Mesmo ISBN │  │ Outra edição│ │ Não informado│                  │
│ │ Ver fonte ↗│  │ Ver fonte ↗│  │ Ver fonte ↗│                    │
│ └────────────┘  └────────────┘  └────────────┘                    │
│                                                                    │
│ Seleção: título da edição             [Cancelar] [Usar esta capa] │
└────────────────────────────────────────────────────────────────────┘
```

A quantidade de colunas se adapta ao espaço disponível. Os títulos e autores longos devem continuar legíveis, sem cortar informações essenciais ou quebrar o cartão.

## Identificação da edição

- Quando o livro tiver ISBN válido e o resultado informar ISBN comparável, mostrar **Mesmo ISBN** ou **Outra edição**.
- Quando não houver dados suficientes para comparar, mostrar **ISBN não informado ou não comparável**. Não afirmar que a edição é igual ou diferente sem evidência.
- Ao selecionar **Outra edição**, manter um aviso próximo à confirmação: “Esta capa é de outra edição. O ISBN e os demais dados do livro não serão alterados.” Essa escolha já foi aprovada; não substitui a revisão da capa pela proprietária.
- A identificação da fonte e os links para os resultados do Google Books devem permanecer visíveis, conforme as regras aplicáveis da fonte. Os detalhes serão verificados na implementação.

## Estados

```text
ANTES DA BUSCA                  CARREGANDO
Preencha título ou autor.       Pesquisando capas…
Você pode ajustar os dois.      [indicador de progresso]

SEM RESULTADOS                  FALHA NA PESQUISA
Não encontramos resultados.     Não foi possível pesquisar agora.
Confira o título ou o autor.    Confira sua conexão e tente novamente.
[ Pesquisar novamente ]         [ Tentar novamente ]
[ Cancelar ]                    [ Cancelar ]
```

O texto digitado e a capa anterior devem permanecer disponíveis em caso de erro. Mensagens importantes ficam na própria seção e são anunciadas de forma acessível. Sem capa selecionável, a usuária pode voltar ao formulário e manter a capa atual ou padrão.

## Para validação

1. A grade de capas com dados resumidos ajuda a encontrar a imagem desejada?
2. A forma de escolher e confirmar a capa está clara, inclusive quando pertence a outra edição?
3. A área de confirmação deve permanecer visível enquanto a lista rola, como proposto?

Depois da validação, preparar um protótipo visual para celular e computador, nos temas claro e escuro, antes de alterar a interface real. A consulta real continua dependendo da configuração da chave e de testes com o serviço.
