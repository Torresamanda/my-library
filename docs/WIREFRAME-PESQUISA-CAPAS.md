# Escolha de capa por pesquisa — esquema para validação

## Objetivo

Permitir pesquisar e escolher uma capa diretamente na biblioteca, sem precisar baixar a imagem no dispositivo. A pesquisa usa inicialmente o título e o autor preenchidos, com opção de alterar o texto.

## Fluxo proposto

1. No cadastro ou na edição, tocar em **Pesquisar capa** junto à prévia.
2. Abrir um painel de pesquisa com título e autor já preenchidos e editáveis. Mostrar os resultados do Google Livros na ordem fornecida pela fonte, com sua identificação, atribuição e link para a página de cada resultado.
3. Apresentar a capa quando disponível, além dos dados de edição que a fonte fornecer. Se houver ISBN no cadastro, indicar se ele coincide com o ISBN do resultado, se é diferente ou se não foi possível comparar.
4. Permitir escolher uma capa de outra edição identificada, conforme decisão da proprietária. Antes de aplicar, deixar clara a diferença; a escolha altera apenas a capa, sem trocar ISBN nem os outros dados da edição cadastrada.
5. Ao confirmar, voltar ao formulário com a capa escolhida em prévia. A escolha só será persistida ao salvar o livro; cancelar preserva os dados anteriores.
6. Se não houver resultados ou a consulta falhar, informar e permitir nova tentativa, manutenção da capa atual ou uso da capa padrão.

## Envio de arquivo

Para livros sem ISBN, manter também a opção já aprovada de selecionar JPG, JPEG ou PNG de até 2 MB. Para livros com ISBN, não oferecer envio de arquivo, preservando a regra existente. A implementação do armazenamento privado no R2 continua pendente e não deve ativar serviços pagos.

## Esquema

```text
┌──────────────────────────────────┐
│ Escolher capa                    │
│ Título [______________________] │
│ Autor  [______________________] │
│ [ Pesquisar ]                    │
│                                  │
│ Resultados fornecidos pelo       │
│ Google Livros + atribuição       │
│ ┌──────┐ Título da edição        │
│ │ CAPA │ Autor · Editora         │
│ │      │ Mesmo ISBN / diferente  │
│ └──────┘ [Ver fonte] [Escolher]  │
│                                  │
│ [ Cancelar ]                     │
└──────────────────────────────────┘
```

A atribuição e os links seguirão as [diretrizes do Google Books](https://developers.google.com/books/branding). A pesquisa não garante encontrar a capa ou a edição; os dados da fonte podem estar incompletos. A integração precisa de identificação própria do projeto e de configuração segura no servidor; não reutilizar configurações de autenticação como segredo nem incluir chaves em URLs ou no código versionado.

## Validação pendente

A proprietária aprovou pesquisar usando título e autor editáveis e poder escolher uma capa de outra edição identificada. O esquema de interação e sua aparência ainda devem ser validados antes do protótipo e da implementação, conforme o processo do projeto.
