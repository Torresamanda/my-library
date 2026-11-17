# Cadastro mais leve — proposta para validação

**Situação: proposta de fluxo.** A proprietária escolheu poder salvar após preencher os dados principais. A divisão abaixo ainda precisa de validação antes do protótipo e da implementação. Os esquemas usam dados fictícios.

## Ideia principal

O cadastro continua no painel existente, com **três etapas curtas e opcionais após a primeira**. Título e autor são obrigatórios; ISBN é opcional. Após preencher os dados principais e corrigir eventuais erros nos dados informados, a ação **Salvar livro** permite concluir sem visitar as etapas seguintes. Os campos opcionais permanecem editáveis nos detalhes do livro depois de salvar.

### 1. Livro

```text
┌────────────────────────────────┐
│ Adicionar livro            [×] │
│ ① Livro ━━━ ② Organização ━ ③ Leitura │
│                                │
│ Qual livro vamos adicionar?    │
│                                │
│ ISBN (opcional)                │
│ [ Digite ou leia o ISBN      ] │
│ [ Consultar ] [ Usar câmera ]  │
│                                │
│ [ CAPA ]  Título *             │
│ [      ]  [                  ] │
│ [      ]  Autor *              │
│           [                  ] │
│ [ Pesquisar capa ]             │
│                                │
│ [ Continuar para organização ] │
│ [ Salvar livro ]               │
└────────────────────────────────┘
```

- Consulta por ISBN e câmera continuam opcionais; título e autor podem ser digitados diretamente. O ISBN válido continua iniciando a consulta automática, com opção de repetir.
- Pesquisar capa abre a experiência existente, sem perder o preenchimento. A escolha pode preencher campos vazios conforme a regra aprovada; os dados encontrados continuam revisáveis nas etapas correspondentes.
- Uma prévia vazia representa a capa padrão. Envio de arquivo ainda não implementado não deve parecer disponível.
- Se a consulta estiver em andamento, indicar o estado e manter a proteção atual contra respostas antigas; não finalizar um salvamento enquanto a consulta que pode alterar os dados estiver pendente.

### 2. Organização — opcional

```text
┌────────────────────────────────┐
│ Adicionar livro            [×] │
│ ✓ Livro ━━━ ② Organização ━ ③ Leitura │
│                                │
│ Como organizar esta edição?    │
│ Você pode preencher depois.    │
│                                │
│ Tipo     [Livro] [Quadrinho]…  │
│ Formato  [Físico] [E-book]…    │
│ Gêneros  [__________________]  │
│                                │
│ Mais dados da edição        ▾  │
│ Editora · páginas · série     │
│ e volume quando expandido      │
│                                │
│ [ Continuar para leitura ]     │
│ [ Salvar livro ]   [ Voltar ] │
└────────────────────────────────┘
```

- Quantidade continua aparecendo quando a regra de posse existente exigir; a escolha de formatos continua múltipla e “Não tenho” mantém seu comportamento atual.
- Editora, páginas, série e volume permanecem acessíveis. Se vierem preenchidos pela pesquisa, apresentar indicação clara e abrir os dados para revisão. Campos preenchidos não são apagados ao mudar de etapa.
- Se houver volume sem série, ou outro dado opcional inválido, indicar o campo e impedir o salvamento até corrigir. A seção correspondente é aberta automaticamente.

### 3. Leitura — opcional

```text
┌────────────────────────────────┐
│ Adicionar livro            [×] │
│ ✓ Livro ━ ✓ Organização ━ ③ Leitura │
│                                │
│ Como está sua leitura?         │
│ Você pode preencher depois.    │
│                                │
│ [Não lido] [Lendo]             │
│ [Concluído] [Abandonado]       │
│ ♡ Marcar como favorito         │
│ ☆ ☆ ☆ ☆ ☆  Avaliação opcional │
│ Comentário opcional            │
│ [ editor                    ]  │
│ 0 de 500 caracteres            │
│                                │
│ [ Salvar livro ]   [ Voltar ] │
└────────────────────────────────┘
```

O status inicial continua **Não lido**. Favorito, avaliação e comentário continuam opcionais; a avaliação aceita uma a cinco estrelas inteiras ou nenhuma e o comentário mantém as regras de formatação e contagem existentes.

## Navegação e segurança dos dados

- **Voltar** preserva tudo o que já foi preenchido, inclusive capa, escolhas e comentário. A passagem entre etapas não grava dados.
- A mudança de etapa posiciona o foco no título da nova etapa. A etapa atual e o progresso são informados também para leitores de tela, sem depender apenas de cor.
- A primeira etapa valida título, autor e ISBN antes de avançar ou salvar. Ao salvar de qualquer etapa, validar todos os dados informados; se houver erro em outra etapa, voltar a ela, mostrar a orientação junto ao campo e levar o foco ao problema.
- Fechar, clicar fora ou cancelar com alterações mantém a confirmação existente. Uma falha de gravação preserva os dados, informa o ocorrido e permite tentar novamente.
- Cada etapa deve caber confortavelmente no celular sem depender de botões sobrepostos ao teclado. Se as ações permanecerem visíveis durante a rolagem, reservar espaço para elas e para a área segura do dispositivo. No computador, aproveitar a largura sem alterar a ordem.
- **Edição existente:** proposta manter o mesmo agrupamento, sem exigir que a pessoa repasse todas as etapas; os campos já preenchidos e os controles de cancelar/salvar permanecem disponíveis. O acesso direto às seções será detalhado no protótipo.

## Pontos para validar

1. A divisão **Livro → Organização → Leitura** faz sentido?
2. Na primeira tela, prefere manter **Salvar livro** visível ao lado de **Continuar**, como no esquema?
3. Na edição de um livro existente, o acesso direto às seções é adequado?

Após a validação do fluxo, criar e validar um protótipo visual para celular e computador antes de alterar a aplicação.
