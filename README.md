# CRUD de Produtos — Node.js, Express e MySQL

Aplicação fullstack de cadastro de produtos: API REST em Express com MySQL e um
frontend em HTML, CSS e JavaScript puro, sem framework.

## Estrutura

```
BACKEND-PRODUTO/
  server.js                      API REST (Express)
  index.js                       roteiro de teste do CRUD direto no banco
  database.js                    pool de conexão MySQL, lê as variáveis do .env
  database.sql                   cria o banco e a tabela
  models/Produto.js              entidade
  persistence/ProdutoRepository.js  acesso ao banco (SQL parametrizado)
  frontend/                      interface em HTML, CSS e JS puro
```

A separação em *model* e *repository* mantém o SQL fora das rotas: `server.js`
cuida de HTTP e o repositório cuida de banco.

## Rodar

**1. Instale as dependências**

```bash
npm install
```

**2. Crie o banco**

```bash
mysql -u root -p < BACKEND-PRODUTO/database.sql
```

**3. Configure as credenciais**

Copie `BACKEND-PRODUTO/.env.example` para `BACKEND-PRODUTO/.env` e preencha com
os seus dados de MySQL:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=backend_produtos
DB_PORT=3306
```

O `.env` está no `.gitignore` e nunca deve ser versionado.

**4. Suba a API**

```bash
node BACKEND-PRODUTO/server.js
```

A API sobe em http://localhost:3000. Abra `BACKEND-PRODUTO/frontend/index.html`
no navegador para usar a interface.

## Endpoints

| Método   | Rota            | O que faz                                    |
| -------- | --------------- | -------------------------------------------- |
| `GET`    | `/produtos`     | lista todos os produtos                      |
| `GET`    | `/produtos/:id` | busca um produto; 404 se não existir          |
| `POST`   | `/produtos`     | cadastra um produto                          |
| `PUT`    | `/produtos/:id` | atualiza um produto; 404 se não existir       |
| `DELETE` | `/produtos/:id` | remove um produto; 404 se não existir         |

Corpo esperado no `POST` e no `PUT`:

```json
{
  "nome": "Mouse Gamer",
  "categoria": "Periféricos",
  "preco": 150.0,
  "quantidade": 10
}
```

### Detalhe do POST

Cadastrar um produto que já existe — mesmo nome, mesma categoria e mesmo preço,
ignorando maiúsculas e espaços — **não cria duplicata**: a quantidade é somada
ao estoque do registro existente e a resposta avisa que isso aconteceu.

## Decisões

- **SQL parametrizado** em todas as consultas (`?` com `execute`), então valores
  do usuário nunca entram concatenados na query — é o que evita injeção de SQL.
- **Credenciais fora do código**: `database.js` lê tudo de `process.env`, e o
  `.env` fica de fora do Git.
- **CORS liberado** para o frontend conseguir chamar a API rodando em outra
  origem durante o desenvolvimento.

## Possíveis próximos passos

- Validar o corpo das requisições antes de gravar (hoje um `POST` sem `nome`
  chega no banco e falha lá, em vez de responder 400).
- Adicionar um script `start` no `package.json` para não precisar digitar o
  caminho completo do `server.js`.
- Tornar a porta configurável por `.env`, como já é feito com o banco.
