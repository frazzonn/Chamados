const rotas = [
  [/^\/?$/, () => telaDashboard()],
  [/^\/clientes$/, () => telaClientesLista()],
  [/^\/clientes\/novo$/, () => telaClientesForm(null)],
  [/^\/clientes\/(\d+)$/, (m) => telaClientesDetalhe(m[1])],
  [/^\/clientes\/(\d+)\/editar$/, (m) => telaClientesForm(m[1])],
  [/^\/categorias$/, () => telaCategorias(null)],
  [/^\/categorias\/(\d+)\/editar$/, (m) => telaCategorias(m[1])],
  [/^\/tecnicos$/, () => telaTecnicos(null)],
  [/^\/tecnicos\/(\d+)\/editar$/, (m) => telaTecnicos(m[1])],
  [/^\/chamados$/, (m, params) => telaChamadosLista(params)],
  [/^\/chamados\/novo$/, (m, params) => telaChamadosNovo(params)],
  [/^\/chamados\/(\d+)$/, (m) => telaChamadoDetalhe(m[1])],
];

async function navegar() {
  const [caminhoBruto, consulta = ""] = location.hash
    .replace(/^#/, "")
    .split("?");
  const caminho = caminhoBruto || "/";
  const params = new URLSearchParams(consulta);

  const secao = caminho.split("/")[1] || "dashboard";
  document
    .querySelectorAll(".topo nav a")
    .forEach((a) => a.classList.toggle("ativo", a.dataset.rota === secao));

  for (const [padrao, tela] of rotas) {
    const m = caminho.match(padrao);
    if (m) {
      try {
        await tela(m, params);
      } catch (e) {
        app.innerHTML = `<div class="card">${esc(e.message)}</div>`;
      }
      return;
    }
  }
  app.innerHTML = '<div class="card vazio">Página não encontrada.</div>';
}

window.addEventListener("hashchange", navegar);
navegar();
