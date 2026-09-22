const connection = require("../database");

class ProdutoRepository {

async buscarProdutoIgual(nome, categoria, preco) {
    const sql = `
        SELECT * FROM produtos
        WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))
        AND LOWER(TRIM(categoria)) = LOWER(TRIM(?))
        AND preco = ?
    `;

    const [produtos] = await connection.execute(sql, [
        nome,
        categoria,
        preco
    ]);

    return produtos[0];
}    

async buscarPorNomeECategoria(nome, categoria) {
    const sql = `
        SELECT * FROM produtos
        WHERE LOWER(nome) = LOWER(?)
        AND LOWER(categoria) = LOWER(?)
    `;

    const [produtos] = await connection.execute(sql, [
        nome,
        categoria
    ]);

    return produtos[0];
}    
   
async buscarPorId(id) {
    const sql = `SELECT * FROM produtos WHERE id = ?`;

    const [produto] = await connection.execute(sql, [id]);

    return produto[0];
}

async inserir(produto) {
    const sql = `
        INSERT INTO produtos
        (nome, categoria, preco, quantidade)
        VALUES (?, ?, ?, ?)
    `;

    const [resultado] = await connection.execute(sql, [
        produto.nome,
        produto.categoria,
        produto.preco,
        produto.quantidade
    ]);

    return resultado.insertId;
}

    async listarTodos() {

        const sql = `SELECT * FROM produtos`;

        const [produtos] = await connection.execute(sql);

        return produtos;
    }

    async atualizar(id, produto) {

        const sql = `
            UPDATE produtos
            SET nome = ?, categoria = ?, preco = ?, quantidade = ?
            WHERE id = ?
        `;

        await connection.execute(sql, [
            produto.nome,
            produto.categoria,
            produto.preco,
            produto.quantidade,
            id
        ]);
    }

    async remover(id) {

        const sql = `
            DELETE FROM produtos
            WHERE id = ?
        `;

        await connection.execute(sql, [id]);
    }
}

module.exports = ProdutoRepository;