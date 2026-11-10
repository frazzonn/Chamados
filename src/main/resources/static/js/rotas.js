const rotas = [
  [/^\/?$/, () => (location.hash = "#/clientes")],
  [/^\/clientes$/, () => telaClientesLista()],
  [/^\/clientes\/novo$/, () => telaClientesForm(null)],
  [/^\/clientes\/(\d+)$/, (m) => telaClientesDetalhe(m[1])],
  [/^\/clientes\/(\d+)\/editar$/, (m) => telaClientesForm(m[1])],
  [/^\/categorias$/, () => telaCategorias(null)],
  [/^\/categorias\/(\d+)\/editar$/, (m) => telaCategorias(m[1])],
];

async function navegar() {
  const caminho = location.hash.replace(/^#/, "") || "/";

  const secao = caminho.split("/")[1] || "dashboard";
  document
    .querySelectorAll(".topo nav a")
    .forEach((a) => a.classList.toggle("ativo", a.dataset.rota === secao));

  for (const [padrao, tela] of rotas) {
    const m = caminho.match(padrao);
    if (m) {
      try {
        await tela(m);
      } catch (e) {
        app.innerHTML = `<div class="card">${esc(e.message)}</div>`;
      }
      return;
    }
  }
  app.innerHTML = '<div class="card vazio">Tela ainda não implementada.</div>';
}

window.addEventListener("hashchange", navegar);
navegar();
