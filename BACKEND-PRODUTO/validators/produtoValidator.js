// Valida o corpo de POST/PUT antes de chegar no banco.
// Retorna { erros, produto }: se "erros" vier vazio, "produto" já está
// com os campos limpos e convertidos para número.

// Aceita número ou texto numérico ("150.5"); recusa vazio, booleano, lista etc.
function ehNumerico(valor) {
    const tipoValido =
        typeof valor === "number" ||
        (typeof valor === "string" && valor.trim() !== "");

    return tipoValido && Number.isFinite(Number(valor));
}

function validarProduto(dados) {
    const erros = [];
    const corpo = dados || {};

    const nome = typeof corpo.nome === "string" ? corpo.nome.trim() : "";
    const categoria = typeof corpo.categoria === "string" ? corpo.categoria.trim() : "";
    const preco = Number(corpo.preco);
    const quantidade = Number(corpo.quantidade);

    if (!nome) {
        erros.push("nome é obrigatório");
    } else if (nome.length > 100) {
        erros.push("nome deve ter no máximo 100 caracteres");
    }

    if (!categoria) {
        erros.push("categoria é obrigatória");
    } else if (categoria.length > 100) {
        erros.push("categoria deve ter no máximo 100 caracteres");
    }

    // Limites seguem as colunas do banco: DECIMAL(10,2) e INT.
    if (!ehNumerico(corpo.preco) || preco < 0 || preco > 99999999.99) {
        erros.push("preco deve ser um número entre 0 e 99999999.99");
    }

    if (!ehNumerico(corpo.quantidade) || !Number.isInteger(quantidade) || quantidade < 0 || quantidade > 2147483647) {
        erros.push("quantidade deve ser um número inteiro maior ou igual a zero");
    }

    return {
        erros,
        produto: { nome, categoria, preco, quantidade }
    };
}

function validarId(valor) {
    const id = Number(valor);

    return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { validarProduto, validarId };
