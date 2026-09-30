const form = document.getElementById("form-produto");

const listaProdutos = document.getElementById("lista-produtos");

const mensagem = document.getElementById("mensagem");

const produtoId = document.getElementById("produto-id");

const btnSubmit = document.getElementById("btn-submit");

const API_URL = "http://localhost:3000/produtos";


// LISTAR PRODUTOS
async function carregarProdutos() {
    const resposta = await fetch(API_URL);

    const produtos = await resposta.json();

    renderizarProdutos(produtos);
}


// RENDERIZAR TABELA E ATUALIZAR RELATÓRIOS
function renderizarProdutos(produtos) {
    listaProdutos.innerHTML = "";

    let quantidadeProdutos = produtos.length;
    let somaEstoque = 0;
    let somaValores = 0;

    if (produtos.length === 0) {
        listaProdutos.innerHTML = `
            <tr>
                <td colspan="6">Nenhum produto encontrado.</td>
            </tr>
        `;

        atualizarRelatorios(0, 0, 0);
        return;
    }

    produtos.forEach((produto) => {
        somaEstoque += Number(produto.quantidade);

        somaValores +=
            Number(produto.preco) * Number(produto.quantidade);

        listaProdutos.appendChild(criarLinhaProduto(produto));
    });

    atualizarRelatorios(
        quantidadeProdutos,
        somaEstoque,
        somaValores
    );
}


// MONTAR LINHA DA TABELA
// Usa textContent em vez de innerHTML: se alguém cadastrar um nome com
// <script> ou <img onerror=...>, ele aparece como texto e não é executado (XSS).
function criarLinhaProduto(produto) {
    const linha = document.createElement("tr");

    const colunas = [
        produto.id,
        produto.nome,
        produto.categoria,
        `R$ ${Number(produto.preco).toFixed(2)}`,
        produto.quantidade
    ];

    colunas.forEach((valor) => {
        const celula = document.createElement("td");
        celula.textContent = valor;
        linha.appendChild(celula);
    });

    const acoes = document.createElement("td");

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => editarProduto(produto.id));

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.className = "btn-delete";
    btnExcluir.addEventListener("click", () => removerProduto(produto.id));

    acoes.append(btnEditar, btnExcluir);
    linha.appendChild(acoes);

    return linha;
}


// MENSAGEM DE ERRO DA API
async function lerErro(resposta) {
    try {
        const corpo = await resposta.json();

        if (corpo.erros) {
            return `${corpo.mensagem}: ${corpo.erros.join("; ")}`;
        }

        return corpo.mensagem || "Erro ao comunicar com a API.";
    } catch {
        return "Erro ao comunicar com a API.";
    }
}


// ATUALIZAR CARDS E RELATÓRIOS
function atualizarRelatorios(total, estoque, valor) {
    const totalProdutos = document.getElementById("total-produtos");
    const totalEstoque = document.getElementById("total-estoque");
    const valorTotal = document.getElementById("valor-total");

    const relatorioProdutos = document.getElementById("relatorio-produtos");
    const relatorioEstoque = document.getElementById("relatorio-estoque");
    const relatorioValor = document.getElementById("relatorio-valor");

    const textoRelatorio = document.getElementById("texto-relatorio");

    if (totalProdutos) {
        totalProdutos.innerText = total;
    }

    if (totalEstoque) {
        totalEstoque.innerText = estoque;
    }

    if (valorTotal) {
        valorTotal.innerText = `R$ ${valor.toFixed(2)}`;
    }

    if (relatorioProdutos) {
        relatorioProdutos.innerText = total;
    }

    if (relatorioEstoque) {
        relatorioEstoque.innerText = estoque;
    }

    if (relatorioValor) {
        relatorioValor.innerText = `R$ ${valor.toFixed(2)}`;
    }

    if (textoRelatorio) {
        textoRelatorio.innerText =
            `Atualmente existem ${total} produto(s) cadastrados, totalizando ${estoque} item(ns) em estoque, com valor estimado de R$ ${valor.toFixed(2)}.`;
    }
}


// CADASTRAR OU ATUALIZAR
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const produto = {
        nome: document.getElementById("nome").value,
        categoria: document.getElementById("categoria").value,
        preco: Number(document.getElementById("preco").value),
        quantidade: Number(document.getElementById("quantidade").value)
    };

    if (produtoId.value) {
        const resposta = await fetch(`${API_URL}/${produtoId.value}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produto)
        });

        if (!resposta.ok) {
            mensagem.innerText = await lerErro(resposta);
            return;
        }

        mensagem.innerText = "Produto atualizado com sucesso.";
        btnSubmit.innerText = "Cadastrar Produto";
        produtoId.value = "";
    } else {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(produto)
        });

        if (!resposta.ok) {
            mensagem.innerText = await lerErro(resposta);
            return;
        }

        const resultado = await resposta.json();

        mensagem.innerText = resultado.mensagem;
    }

    form.reset();

    carregarProdutos();
});


// REMOVER PRODUTO
async function removerProduto(id) {
    const resposta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!resposta.ok) {
        mensagem.innerText = await lerErro(resposta);
        return;
    }

    mensagem.innerText = "Produto removido com sucesso.";

    carregarProdutos();
}


// EDITAR PRODUTO
async function editarProduto(id) {
    const resposta = await fetch(`${API_URL}/${id}`);

    const produto = await resposta.json();

    produtoId.value = produto.id;

    document.getElementById("nome").value = produto.nome;
    document.getElementById("categoria").value = produto.categoria;
    document.getElementById("preco").value = produto.preco;
    document.getElementById("quantidade").value = produto.quantidade;

    btnSubmit.innerText = "Atualizar Produto";

    mensagem.innerText = "Editando produto ID " + produto.id;

    abrirPaginaPorId("produtos");
}


// PESQUISAR PRODUTO
async function pesquisarProduto() {
    const id = document.getElementById("pesquisa-id").value;

    if (!id) {
        mensagem.innerText = "Digite um ID para pesquisar.";
        return;
    }

    const resposta = await fetch(`${API_URL}/${id}`);

    if (!resposta.ok) {
        mensagem.innerText = "Produto não encontrado.";
        renderizarProdutos([]);
        return;
    }

    const produto = await resposta.json();

    mensagem.innerText = "Produto encontrado.";

    renderizarProdutos([produto]);
}


// ABRIR PÁGINA PELO MENU
function abrirPagina(pagina, elemento) {
    abrirPaginaPorId(pagina);

    const links = document.querySelectorAll(".menu-link");

    links.forEach((link) => {
        link.classList.remove("active");
    });

    elemento.classList.add("active");
}


// TROCAR PÁGINA
function abrirPaginaPorId(pagina) {
    const paginas = document.querySelectorAll(".page");

    paginas.forEach((item) => {
        item.classList.remove("active-page");
    });

    document.getElementById(pagina).classList.add("active-page");

    const titulo = document.getElementById("titulo-pagina");
    const subtitulo = document.getElementById("subtitulo-pagina");

    if (pagina === "dashboard") {
        titulo.innerText = "Dashboard";
        subtitulo.innerText = "Visão geral do sistema.";
    }

    if (pagina === "produtos") {
        titulo.innerText = "Produtos";
        subtitulo.innerText = "Cadastro, edição, pesquisa e exclusão.";
    }

    if (pagina === "relatorios") {
        titulo.innerText = "Relatórios";
        subtitulo.innerText = "Resumo automático do estoque.";
    }

    if (pagina === "configuracoes") {
        titulo.innerText = "Configurações";
        subtitulo.innerText = "Informações técnicas da aplicação.";
    }

    carregarProdutos();
}


// INICIAR SISTEMA
carregarProdutos();