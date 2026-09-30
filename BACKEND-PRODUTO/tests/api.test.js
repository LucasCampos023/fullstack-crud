// Testa as rotas de verdade (Express), trocando o MySQL por um
// repositório em memória com os mesmos métodos do ProdutoRepository.

const { test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

const criarApp = require("../app.js");

class RepositorioEmMemoria {
    constructor() {
        this.produtos = [];
        this.proximoId = 1;
    }

    async listarTodos() {
        return this.produtos;
    }

    async buscarPorId(id) {
        return this.produtos.find((p) => p.id === Number(id));
    }

    async buscarProdutoIgual(nome, categoria, preco) {
        const normalizar = (texto) => texto.trim().toLowerCase();

        return this.produtos.find((p) =>
            normalizar(p.nome) === normalizar(nome) &&
            normalizar(p.categoria) === normalizar(categoria) &&
            Number(p.preco) === Number(preco)
        );
    }

    async inserir(produto) {
        const id = this.proximoId++;
        this.produtos.push({ id, ...produto });
        return id;
    }

    async atualizar(id, produto) {
        const indice = this.produtos.findIndex((p) => p.id === Number(id));
        this.produtos[indice] = { id: Number(id), ...produto };
    }

    async remover(id) {
        this.produtos = this.produtos.filter((p) => p.id !== Number(id));
    }
}

let servidor;
let baseUrl;
let repositorio;

beforeEach(async () => {
    repositorio = new RepositorioEmMemoria();

    const app = criarApp(repositorio);

    await new Promise((resolve) => {
        servidor = app.listen(0, resolve);
    });

    baseUrl = `http://localhost:${servidor.address().port}/produtos`;
});

afterEach(() => {
    servidor.close();
});

function enviar(metodo, caminho, corpo) {
    return fetch(baseUrl + caminho, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: corpo === undefined ? undefined : JSON.stringify(corpo)
    });
}

const mouse = { nome: "Mouse Gamer", categoria: "Periféricos", preco: 150, quantidade: 10 };

test("POST cadastra e GET devolve o produto", async () => {
    const criado = await enviar("POST", "", mouse);
    assert.equal(criado.status, 201);

    const { id } = await criado.json();

    const busca = await fetch(`${baseUrl}/${id}`);
    assert.equal(busca.status, 200);
    assert.equal((await busca.json()).nome, "Mouse Gamer");
});

test("POST de produto repetido soma a quantidade em vez de duplicar", async () => {
    await enviar("POST", "", mouse);
    await enviar("POST", "", { ...mouse, nome: "  mouse gamer ", quantidade: 5 });

    assert.equal(repositorio.produtos.length, 1);
    assert.equal(repositorio.produtos[0].quantidade, 15);
});

test("POST com dados inválidos responde 400 e não grava", async () => {
    const resposta = await enviar("POST", "", { nome: "", preco: -5 });

    assert.equal(resposta.status, 400);
    assert.ok((await resposta.json()).erros.length > 0);
    assert.equal(repositorio.produtos.length, 0);
});

test("JSON malformado responde 400", async () => {
    const resposta = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ nome: "
    });

    assert.equal(resposta.status, 400);
});

test("PUT atualiza e DELETE remove", async () => {
    const { id } = await (await enviar("POST", "", mouse)).json();

    const atualizado = await enviar("PUT", `/${id}`, { ...mouse, preco: 199.9 });
    assert.equal(atualizado.status, 200);
    assert.equal(repositorio.produtos[0].preco, 199.9);

    const removido = await enviar("DELETE", `/${id}`);
    assert.equal(removido.status, 200);
    assert.equal(repositorio.produtos.length, 0);
});

test("ID inexistente responde 404 e ID inválido responde 400", async () => {
    assert.equal((await fetch(`${baseUrl}/999`)).status, 404);
    assert.equal((await fetch(`${baseUrl}/abc`)).status, 400);
    assert.equal((await enviar("DELETE", "/999")).status, 404);
});
