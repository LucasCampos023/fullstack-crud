const { test } = require("node:test");
const assert = require("node:assert/strict");

const { validarProduto, validarId } = require("../validators/produtoValidator.js");

const produtoValido = {
    nome: "Mouse Gamer",
    categoria: "Periféricos",
    preco: 150,
    quantidade: 10
};

test("aceita um produto válido", () => {
    const { erros } = validarProduto(produtoValido);

    assert.deepEqual(erros, []);
});

test("remove espaços e converte números vindos como texto", () => {
    const { erros, produto } = validarProduto({
        nome: "  Teclado  ",
        categoria: " Periféricos ",
        preco: "99.90",
        quantidade: "3"
    });

    assert.deepEqual(erros, []);
    assert.deepEqual(produto, {
        nome: "Teclado",
        categoria: "Periféricos",
        preco: 99.9,
        quantidade: 3
    });
});

test("recusa nome e categoria vazios", () => {
    const { erros } = validarProduto({ ...produtoValido, nome: "   ", categoria: "" });

    assert.equal(erros.length, 2);
});

test("recusa preço negativo ou não numérico", () => {
    assert.equal(validarProduto({ ...produtoValido, preco: -1 }).erros.length, 1);
    assert.equal(validarProduto({ ...produtoValido, preco: "abc" }).erros.length, 1);
    assert.equal(validarProduto({ ...produtoValido, preco: true }).erros.length, 1);
});

test("recusa quantidade decimal ou ausente", () => {
    assert.equal(validarProduto({ ...produtoValido, quantidade: 1.5 }).erros.length, 1);
    assert.equal(validarProduto({ ...produtoValido, quantidade: undefined }).erros.length, 1);
});

test("recusa corpo vazio com todos os erros", () => {
    assert.equal(validarProduto(undefined).erros.length, 4);
});

test("validarId aceita só inteiros positivos", () => {
    assert.equal(validarId("7"), 7);
    assert.equal(validarId("0"), null);
    assert.equal(validarId("-3"), null);
    assert.equal(validarId("abc"), null);
    assert.equal(validarId("1.5"), null);
});
