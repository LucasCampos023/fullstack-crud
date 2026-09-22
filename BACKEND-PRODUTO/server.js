

const express = require("express");
const cors = require("cors");

const Produto = require("./models/Produto.js");
const ProdutoRepository = require("./persistence/ProdutoRepository.js");

const app = express();

const repository = new ProdutoRepository();

app.use(cors());

app.use(express.json());


// GET TODOS
app.get("/produtos", async (req, res) => {

    const produtos = await repository.listarTodos();

    res.json(produtos);
});


// GET POR ID
app.get("/produtos/:id", async (req, res) => {

    const id = req.params.id;

    const produto = await repository.buscarPorId(id);

    if (!produto) {

        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    res.json(produto);
});


// POST
app.post("/produtos", async (req, res) => {
    const { nome, categoria, preco, quantidade } = req.body;

    const produtoExistente = await repository.buscarProdutoIgual(
        nome,
        categoria,
        preco
    );

    if (produtoExistente) {
        const novaQuantidade =
            Number(produtoExistente.quantidade) + Number(quantidade);

        const produtoAtualizado = new Produto(
            produtoExistente.nome,
            produtoExistente.categoria,
            produtoExistente.preco,
            novaQuantidade
        );

        await repository.atualizar(
            produtoExistente.id,
            produtoAtualizado
        );

        return res.json({
            mensagem: "Produto já existente. Quantidade somada ao estoque.",
            id: produtoExistente.id
        });
    }

    const produto = new Produto(
        nome,
        categoria,
        preco,
        quantidade
    );

    const id = await repository.inserir(produto);

    res.status(201).json({
        mensagem: "Produto cadastrado com sucesso.",
        id: id
    });
});


// PUT
app.put("/produtos/:id", async (req, res) => {

    const id = req.params.id;

    const {
        nome,
        categoria,
        preco,
        quantidade
    } = req.body;

    const produtoExistente =
        await repository.buscarPorId(id);

    if (!produtoExistente) {

        return res.status(404).json({
            mensagem:
                "Produto não encontrado para atualização"
        });
    }

    const produtoAtualizado = new Produto(
        nome,
        categoria,
        preco,
        quantidade
    );

    await repository.atualizar(
        id,
        produtoAtualizado
    );

    res.json({
        mensagem:
            "Produto atualizado com sucesso"
    });
});


// DELETE
app.delete("/produtos/:id", async (req, res) => {

    const id = req.params.id;

    const produtoExistente =
        await repository.buscarPorId(id);

    if (!produtoExistente) {

        return res.status(404).json({
            mensagem:
                "Produto não encontrado para exclusão"
        });
    }

    await repository.remover(id);

    res.json({
        mensagem:
            "Produto removido com sucesso"
    });
});


app.listen(3000, () => {

    console.log(
        "Servidor rodando em http://localhost:3000"
    );
});