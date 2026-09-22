// ===== index.js =====

const Produto =
    require("./models/Produto.js");

const ProdutoRepository =
    require("./persistence/ProdutoRepository.js");

async function main() {

    const repository =
        new ProdutoRepository();

    console.log("CRIANDO PRODUTO...");

    const produto = new Produto(
        "Mouse Gamer",
        "Periféricos",
        150.00,
        10
    );

    console.log("INSERINDO PRODUTO...");

    const id =
        await repository.inserir(produto);

    console.log(
        "Produto inserido com ID:",
        id
    );

    console.log(
        "CONSULTANDO PRODUTO INSERIDO..."
    );

    let produtoConsultado =
        await repository.buscarPorId(id);

    console.log(produtoConsultado);

    console.log("ATUALIZANDO PRODUTO...");

    const produtoAtualizado =
        new Produto(
            "Mouse Gamer RGB",
            "Periféricos",
            199.90,
            7
        );

    await repository.atualizar(
        id,
        produtoAtualizado
    );

    console.log(
        "CONSULTANDO PRODUTO APÓS UPDATE..."
    );

    produtoConsultado =
        await repository.buscarPorId(id);

    console.log(produtoConsultado);

    console.log(
        "LISTANDO TODOS OS PRODUTOS..."
    );

    const produtos =
        await repository.listarTodos();

    console.log(produtos);

    console.log("REMOVENDO PRODUTO...");

    await repository.remover(id);

    console.log(
        "CONSULTANDO APÓS REMOÇÃO..."
    );

    produtoConsultado =
        await repository.buscarPorId(id);

    console.log(
        produtoConsultado ||
        "Produto removido com sucesso."
    );

    process.exit();
}

main();