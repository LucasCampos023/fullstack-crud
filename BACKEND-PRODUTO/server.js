const criarApp = require("./app.js");
const ProdutoRepository = require("./persistence/ProdutoRepository.js");

const PORTA = Number(process.env.PORT) || 3000;

const app = criarApp(new ProdutoRepository());

app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
