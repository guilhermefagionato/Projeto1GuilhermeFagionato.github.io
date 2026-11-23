const CHAVE_STORAGE = "usuarios";

const formulario = document.getElementById("form-cadastro");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const botaoLimpar = document.getElementById("btn-limpar");
const botaoExcluirTodos = document.getElementById("btn-excluir-todos");
const campoBusca = document.getElementById("busca");
const campoFiltro = document.getElementById("filtro");
const lista = document.getElementById("lista-usuarios");
const mensagemVazia = document.getElementById("mensagem-vazia");

function lerUsuarios() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE_STORAGE));
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    return [];
  }
}

function salvarUsuarios(usuarios) {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(usuarios));
}

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatarData(iso) {
  return new Date(iso).toLocaleString("pt-BR");
}

function criarItem(usuario) {
  const item = document.createElement("li");

  const dados = document.createElement("span");
  dados.className = "dados";
  dados.textContent =
    formatarData(usuario.data) + " | " + usuario.nome + " | " + usuario.email;

  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "botao botao-perigo";
  botao.textContent = "Excluir";
  botao.setAttribute("aria-label", "Excluir " + usuario.nome);
  botao.addEventListener("click", function () {
    excluirUsuario(usuario.id);
  });

  item.appendChild(dados);
  item.appendChild(botao);
  return item;
}

function renderizarLista() {
  const usuarios = lerUsuarios();
  const termo = normalizar(campoBusca.value.trim());
  const campo = campoFiltro.value;

  const filtrados = usuarios.filter(function (usuario) {
    if (campo === "todos") {
      return (
        normalizar(usuario.nome).includes(termo) ||
        normalizar(usuario.email).includes(termo)
      );
    }
    return normalizar(usuario[campo]).includes(termo);
  });

  lista.replaceChildren();
  filtrados.forEach(function (usuario) {
    lista.appendChild(criarItem(usuario));
  });

  if (usuarios.length === 0) {
    mensagemVazia.textContent = "Nenhum usuário cadastrado.";
  } else if (filtrados.length === 0) {
    mensagemVazia.textContent = "Nenhum resultado para a pesquisa.";
  } else {
    mensagemVazia.textContent = "";
  }

  botaoExcluirTodos.disabled = usuarios.length === 0;
}

function cadastrarUsuario(evento) {
  evento.preventDefault();

  const usuario = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    data: new Date().toISOString(),
    nome: campoNome.value.trim(),
    email: campoEmail.value.trim()
  };

  const usuarios = lerUsuarios();
  usuarios.push(usuario);
  salvarUsuarios(usuarios);

  limparFormulario();
  renderizarLista();
}

function limparFormulario() {
  formulario.reset();
  campoNome.focus();
}

function excluirUsuario(id) {
  const usuarios = lerUsuarios();
  const usuario = usuarios.find(function (u) {
    return u.id === id;
  });
  if (!usuario) {
    return;
  }

  if (!confirm('Deseja realmente excluir o usuário "' + usuario.nome + '"?')) {
    return;
  }

  salvarUsuarios(
    usuarios.filter(function (u) {
      return u.id !== id;
    })
  );
  renderizarLista();
}

function excluirTodos() {
  if (lerUsuarios().length === 0) {
    return;
  }

  if (!confirm("Deseja realmente excluir todos os usuários cadastrados?")) {
    return;
  }

  localStorage.removeItem(CHAVE_STORAGE);
  renderizarLista();
}

formulario.addEventListener("submit", cadastrarUsuario);
botaoLimpar.addEventListener("click", limparFormulario);
botaoExcluirTodos.addEventListener("click", excluirTodos);
campoBusca.addEventListener("input", renderizarLista);
campoFiltro.addEventListener("change", renderizarLista);

renderizarLista();
