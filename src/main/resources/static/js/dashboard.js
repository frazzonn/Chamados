async function contarChamados(filtro) {
  const q = new URLSearchParams({ ...filtro, size: 1 });
  const r = await api(`/chamados?${q}`);
  return (r.page ?? r).totalElements;
}

async function telaDashboard() {
  const [porStatus, porPrioridade, recentes, clientes, categorias, tecnicos] =
    await Promise.all([
      Promise.all(STATUS.map((s) => contarChamados({ status: s }))),
      Promise.all(PRIORIDADES.map((p) => contarChamados({ prioridade: p }))),
      api("/chamados?size=5"),
      api("/clientes"),
      api("/categorias"),
      api("/tecnicos"),
    ]);

  const indicador = (href, valor, texto) => `
    <a class="card indicador" href="${href}">
      <div class="valor">${valor}</div>
      <div class="rotulo">${texto}</div>
    </a>`;

  app.innerHTML = `
    <div class="cabecalho">
      <h1>Dashboard</h1>
      <a class="botao primario" href="#/chamados/novo">Novo chamado</a>
    </div>
    <h2>Chamados por status</h2>
    <div class="grade">
      ${STATUS.map((s, i) => indicador(`#/chamados?status=${s}`, porStatus[i], rotulo(s))).join("")}
    </div>
    <h2>Chamados por prioridade</h2>
    <div class="grade">
      ${PRIORIDADES.map((p, i) => indicador(`#/chamados?prioridade=${p}`, porPrioridade[i], rotulo(p))).join("")}
    </div>
    <h2>Cadastros</h2>
    <div class="grade">
      ${indicador("#/clientes", clientes.length, "Clientes")}
      ${indicador("#/categorias", categorias.length, "Categorias")}
      ${indicador("#/tecnicos", tecnicos.length, "Técnicos")}
    </div>
    <div class="card tabela">
      <h2>Últimos chamados</h2>
      ${
        recentes.content.length === 0
          ? '<p class="vazio">Nenhum chamado aberto ainda.</p>'
          : `
      <table>
        <thead><tr><th>#</th><th>Título</th><th>Cliente</th><th>Prioridade</th><th>Status</th><th>Abertura</th></tr></thead>
        <tbody>
          ${recentes.content
            .map(
              (c) => `
            <tr>
              <td>${c.id}</td>
              <td><a href="#/chamados/${c.id}">${esc(c.titulo)}</a></td>
              <td>${esc(c.clienteNome)}</td>
              <td>${seloPrioridade(c.prioridade)}</td>
              <td>${seloStatus(c.status)}</td>
              <td>${dataHora(c.dataAbertura)}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>`
      }
    </div>`;
}
