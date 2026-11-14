# Variáveis de ambiente

Este documento é o inventário das variáveis utilizadas pelo projeto. Sempre que uma variável for adicionada, alterada ou removida, atualize seu nome, finalidade, local de configuração, obrigatoriedade e exemplos sem valores reais. Não inclua credenciais, identificadores pessoais ou tokens reais na documentação ou no repositório.

## API — Cloudflare Worker

| Variável               | Finalidade                                                                             | Obrigatória                       | Desenvolvimento local                                     | Implantação                                      |
| ---------------------- | -------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------- | ------------------------------------------------ |
| `FIREBASE_PROJECT_ID`  | Identificador do projeto Firebase usado para verificar o emissor e o público do token. | Sim, para acessar rotas privadas. | Preencher em `.dev.vars` a partir de `.dev.vars.example`. | Configurar no ambiente do Worker na Cloudflare.  |
| `ALLOWED_FIREBASE_UID` | UID da única conta Firebase autorizada a acessar as rotas privadas.                    | Sim, para acessar rotas privadas. | Preencher em `.dev.vars`; não versionar o valor.          | Configurar como segredo do Worker na Cloudflare. |

Sem qualquer uma dessas variáveis, as rotas privadas negam acesso. A rota pública de saúde funciona sem elas. A API tem rotas privadas de livros; a interface de login ainda não está integrada.

O Wrangler aceita `.dev.vars` ou `.env` no desenvolvimento local; este projeto usa `.dev.vars` para separar a configuração da API. Não mantenha ambos esperando que o Wrangler os combine: se `.dev.vars` existir, ele tem precedência. O exemplo versionado contém apenas valores vazios. Em produção, configure segredos no ambiente da Cloudflare, não em `wrangler.jsonc` nem em arquivos versionados.

## Interface — Vite

Nenhuma variável de ambiente da interface é necessária neste momento. Quando forem adicionadas, documente-as aqui e forneça um `.env.example` sem valores sensíveis. Variáveis com prefixo `VITE_` são expostas ao navegador e devem conter apenas configuração pública; nunca coloque segredos nelas.

Os arquivos locais `.dev.vars` e `.env` são ignorados pelo Git. Reinicie o servidor apropriado após alterar a configuração local.
