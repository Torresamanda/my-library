# Variáveis de ambiente

Este documento é o inventário das variáveis utilizadas pelo projeto. Sempre que uma variável for adicionada, alterada ou removida, atualize seu nome, finalidade, local de configuração, obrigatoriedade e exemplos sem valores reais. Não inclua credenciais, identificadores pessoais ou tokens reais na documentação ou no repositório.

## API — Cloudflare Worker

| Variável               | Finalidade                                                                             | Obrigatória                       | Desenvolvimento local                                     | Implantação                                      |
| ---------------------- | -------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `FIREBASE_PROJECT_ID`  | Identificador do projeto Firebase usado para verificar o emissor e o público do token. | Sim, para acessar rotas privadas. | Preencher em `.dev.vars` a partir de `.dev.vars.example`. | Configurar no ambiente do Worker na Cloudflare.  |
| `ALLOWED_FIREBASE_UID` | UID da única conta Firebase autorizada a acessar as rotas privadas.                    | Sim, para acessar rotas privadas. | Preencher em `.dev.vars`; não versionar o valor.          | Configurar como segredo do Worker na Cloudflare. |

Sem qualquer uma dessas variáveis, as rotas privadas negam acesso. A rota pública de saúde funciona sem elas. A API tem rotas privadas de livros e a interface de login está integrada; a configuração de produção ainda está pendente.

O Wrangler aceita `.dev.vars` ou `.env` no desenvolvimento local; este projeto usa `.dev.vars` para separar a configuração da API. Não mantenha ambos esperando que o Wrangler os combine: se `.dev.vars` existir, ele tem precedência. O exemplo versionado contém apenas valores vazios. Em produção, configure segredos no ambiente da Cloudflare, não em `wrangler.jsonc` nem em arquivos versionados.

## Interface — Vite

Copie `.env.example` para `.env` e preencha a configuração pública do aplicativo Web Firebase. Todas as variáveis abaixo são obrigatórias para iniciar o login; elas são incorporadas à interface e visíveis no navegador. A chave Firebase Web é um identificador público do projeto, não um segredo de autorização; restrinja seu uso aos serviços Firebase adequados. Nunca use uma chave secreta ou de outros serviços nesses campos.

| Variável                    | Finalidade                                                           | Local e implantação                                  |
| --------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`     | Chave pública do aplicativo Web Firebase para identificar o projeto. | `.env` local e variáveis de compilação da interface. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação do aplicativo Firebase.                      | `.env` local e variáveis de compilação da interface. |
| `VITE_FIREBASE_PROJECT_ID`  | Identificador do projeto, correspondente ao usado pela API.          | `.env` local e variáveis de compilação da interface. |
| `VITE_FIREBASE_APP_ID`      | Identificador do aplicativo Web registrado no Firebase.              | `.env` local e variáveis de compilação da interface. |

Mantenha `ALLOWED_FIREBASE_UID` e qualquer segredo exclusivamente no Worker; não os adicione com prefixo `VITE_`. Quando `.dev.vars` estiver presente, o Wrangler usa esse arquivo para a API e não carrega `.env` nele; o Vite continua usando `.env` para a interface.

Os arquivos locais `.dev.vars` e `.env` são ignorados pelo Git. Reinicie o servidor apropriado após alterar a configuração local.

## Pesquisa de capas — Google Books

`GOOGLE_BOOKS_API_KEY` identifica a consulta à API do Google Books. É opcional para os demais recursos e necessária para pesquisar capas nessa fonte. Em desenvolvimento, configure somente em `.dev.vars`; em produção, configure como segredo do Worker. Use uma chave própria restrita à API necessária, sem incluí-la em URLs, interface, exemplos ou registros. A pesquisa falha de forma recuperável se a chave não estiver configurada. Respeite cotas e não ative serviços pagos sem autorização.
