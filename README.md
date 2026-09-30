# CRUD de Produtos — Node.js, Express e MySQL

Aplicação fullstack de cadastro de produtos: API REST em Express com MySQL e um
frontend em HTML, CSS e JavaScript puro, sem framework.

## Estrutura

```
BACKEND-PRODUTO/
  app.js                         rotas da API (Express), recebem o repositório por parâmetro
  server.js                      monta o repositório MySQL e sobe o servidor
  index.js                       roteiro de teste do CRUD direto no banco
  database.js                    pool de conexão MySQL, lê as variáveis do .env
  database.sql                   cria o banco e a tabela
  models/Produto.js              entidade
  persistence/ProdutoRepository.js  acesso ao banco (SQL parametrizado)
  validators/produtoValidator.js    validação do corpo das requisições
  tests/                         testes automatizados (node:test)
  frontend/                      interface em HTML, CSS e JS puro
```

A separação em *model*, *repository* e *validator* mantém cada responsabilidade
no seu lugar: `app.js` cuida de HTTP, o validador decide o que é um produto
válido e o repositório cuida de banco.

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
PORT=3000
```

O `.env` está no `.gitignore` e nunca deve ser versionado.

**4. Suba a API**

```bash
npm start
```

A API sobe em http://localhost:3000 (ou na porta definida em `PORT`). Abra `BACKEND-PRODUTO/frontend/index.html`
no navegador para usar a interface.

**5. Rode os testes**

```bash
npm test
```

Os testes não precisam de MySQL: as rotas rodam contra um repositório em
memória com os mesmos métodos do `ProdutoRepository`.

## Endpoints

| Método   | Rota            | O que faz                                    |
| -------- | --------------- | -------------------------------------------- |
| `GET`    | `/produtos`     | lista todos os produtos                      |
| `GET`    | `/produtos/:id` | busca um produto; 404 se não existir          |
| `POST`   | `/produtos`     | cadastra um produto                          |
| `PUT`    | `/produtos/:id` | atualiza um produto; 404 se não existir       |
| `DELETE` | `/produtos/:id` | remove um produto; 404 se não existir         |

IDs que não são inteiros positivos respondem `400`.

Corpo esperado no `POST` e no `PUT`:

```json
{
  "nome": "Mouse Gamer",
  "categoria": "Periféricos",
  "preco": 150.0,
  "quantidade": 10
}
```

### Validação

`POST` e `PUT` só gravam se:

- `nome` e `categoria` forem textos não vazios (até 100 caracteres);
- `preco` for um número entre 0 e 99999999.99;
- `quantidade` for um inteiro maior ou igual a zero.

Caso contrário, a resposta é `400` com a lista de problemas:

```json
{
  "mensagem": "Dados inválidos",
  "erros": ["nome é obrigatório", "preco deve ser um número entre 0 e 99999999.99"]
}
```

### Detalhe do POST

Cadastrar um produto que já existe — mesmo nome, mesma categoria e mesmo preço,
ignorando maiúsculas e espaços — **não cria duplicata**: a quantidade é somada
ao estoque do registro existente e a resposta avisa que isso aconteceu.

## Decisões

- **SQL parametrizado** em todas as consultas (`?` com `execute`), então valores
  do usuário nunca entram concatenados na query — é o que evita injeção de SQL.
- **Validação antes do banco**: dados inválidos são barrados com `400` e uma
  mensagem clara, em vez de estourar erro no MySQL.
- **Frontend sem XSS**: a tabela é montada com `textContent`, então um nome
  cadastrado com HTML ou script aparece como texto e não é executado.
- **Injeção do repositório**: `criarApp(repository)` permite testar as rotas
  sem banco, trocando o MySQL por uma implementação em memória.
- **Credenciais fora do código**: `database.js` lê tudo de `process.env`, e o
  `.env` fica de fora do Git.
- **CORS liberado** para o frontend conseguir chamar a API rodando em outra
  origem durante o desenvolvimento.

## Possíveis próximos passos

- Publicar a API e o banco (Railway ou Render) com um link de demonstração.
- Rodar `npm test` automaticamente a cada push com GitHub Actions.
- Paginação e busca por nome na listagem.
