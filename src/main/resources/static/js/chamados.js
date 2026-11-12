const STATUS = ["ABERTO", "EM_ATENDIMENTO", "AGUARDANDO_CLIENTE", "FECHADO"];
const PRIORIDADES = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];

function rotulo(valor) {
  return valor ? valor.replaceAll("_", " ") : "";
}

function seloStatus(s) {
  return `<span class="selo st-${s}">${rotulo(s)}</span>`;
}

function seloPrioridade(p) {
  return `<span class="selo pr-${p}">${rotulo(p)}</span>`;
}

function dataHora(valor) {
  return valor ? new Date(valor).toLocaleString("pt-BR") : "—";
}

function opcoes(lista, selecionado, vazio) {
  return (
    (vazio !== undefined ? `<option value="">${vazio}</option>` : "") +
    lista
      .map(
        (o) =>
          `<option value="${esc(o.valor)}" ${String(o.valor) === String(selecionado ?? "") ? "selected" : ""}>${esc(o.texto)}</option>`,
      )
      .join("")
  );
}

async function telaChamadosLista(params) {
  const filtros = {
    status: params.get("status") || "",
    prioridade: params.get("prioridade") || "",
    clienteId: params.get("clienteId") || "",
  };
  const pagina = Number(params.get("page") || 0);

  const consulta = new URLSearchParams({ page: pagina, size: 10 });
  for (const [k, v] of Object.entries(filtros)) if (v) consulta.set(k, v);

  const [resultado, clientes] = await Promise.all([
    api(`/chamados?${consulta}`),
    api("/clientes"),
  ]);
  const chamados = resultado.content;
  const info = resultado.page ?? resultado;
  const totalPaginas = info.totalPages;

  const linkPagina = (p) => {
    const q = new URLSearchParams(params);
    q.set("page", p);
    return `#/chamados?${q}`;
  };

  const novoHref = filtros.clienteId
    ? `#/chamados/novo?clienteId=${filtros.clienteId}`
    : "#/chamados/novo";

  app.innerHTML = `
    <div class="cabecalho">
      <h1>Chamados</h1>
      <a class="botao primario" href="${novoHref}">Novo chamado</a>
    </div>
    <form class="card filtros" id="form-filtros">
      <label>Status
        <select name="status">${opcoes(STATUS.map((s) => ({ valor: s, texto: rotulo(s) })), filtros.status, "Todos")}</select>
      </label>
      <label>Prioridade
        <select name="prioridade">${opcoes(PRIORIDADES.map((p) => ({ valor: p, texto: rotulo(p) })), filtros.prioridade, "Todas")}</select>
      </label>
      <label>Cliente
        <select name="clienteId">${opcoes(clientes.map((c) => ({ valor: c.id, texto: c.nome })), filtros.clienteId, "Todos")}</select>
      </label>
      <button class="primario" type="submit">Filtrar</button>
      <a class="botao" href="#/chamados">Limpar</a>
    </form>
    <div class="card tabela">
      ${
        chamados.length === 0
          ? '<p class="vazio">Nenhum chamado encontrado.</p>'
          : `
      <table>
        <thead><tr><th>#</th><th>Título</th><th>Cliente</th><th>Categoria</th><th>Técnico</th><th>Prioridade</th><th>Status</th><th>Abertura</th></tr></thead>
        <tbody>
          ${chamados
            .map(
              (c) => `
            <tr>
              <td>${c.id}</td>
              <td><a href="#/chamados/${c.id}">${esc(c.titulo)}</a></td>
              <td>${esc(c.clienteNome)}</td>
              <td>${esc(c.categoriaNome)}</td>
              <td>${esc(c.tecnicoNome) || "—"}</td>
              <td>${seloPrioridade(c.prioridade)}</td>
              <td>${seloStatus(c.status)}</td>
              <td>${dataHora(c.dataAbertura)}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
      <div class="paginacao">
        <span>Página ${pagina + 1} de ${Math.max(totalPaginas, 1)} · ${info.totalElements} chamado(s)</span>
        ${pagina > 0 ? `<a class="botao pequeno" href="${linkPagina(pagina - 1)}">Anterior</a>` : ""}
        ${pagina + 1 < totalPaginas ? `<a class="botao pequeno" href="${linkPagina(pagina + 1)}">Próxima</a>` : ""}
      </div>`
      }
    </div>`;

  document.getElementById("form-filtros").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(dadosDoForm(ev.target)))
      if (v) q.set(k, v);
    location.hash = `#/chamados${q.toString() ? "?" + q : ""}`;
  });
}

async function telaChamadosNovo(params) {
  const [clientes, categorias, tecnicos] = await Promise.all([
    api("/clientes"),
    api("/categorias"),
    api("/tecnicos"),
  ]);
  const clienteId = params.get("clienteId") || "";

  app.innerHTML = `
    <div class="cabecalho"><h1>Novo chamado</h1></div>
    <form class="card" id="form-chamado">
      <div class="campos">
        <label class="largo">Título *<input name="titulo" required maxlength="150"></label>
        <label class="largo">Descrição *<textarea name="descricao" required maxlength="1000"></textarea></label>
        <label>Cliente *
          <select name="clienteId" required>${opcoes(clientes.map((c) => ({ valor: c.id, texto: c.nome })), clienteId, "Selecione")}</select>
        </label>
        <label>Categoria *
          <select name="categoriaId" required>${opcoes(categorias.map((c) => ({ valor: c.id, texto: c.nome })), "", "Selecione")}</select>
        </label>
        <label>Prioridade *
          <select name="prioridade" required>${opcoes(PRIORIDADES.map((p) => ({ valor: p, texto: rotulo(p) })), "MEDIA")}</select>
        </label>
        <label>Técnico
          <select name="tecnicoId">${opcoes(tecnicos.map((t) => ({ valor: t.id, texto: t.nome })), "", "Sem técnico")}</select>
        </label>
      </div>
      <div class="linha-botoes">
        <button class="primario" type="submit">Abrir chamado</button>
        <a class="botao" href="#/chamados">Cancelar</a>
      </div>
    </form>`;

  document
    .getElementById("form-chamado")
    .addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const dados = dadosDoForm(ev.target);
      try {
        await api("/chamados", {
          method: "POST",
          body: {
            ...dados,
            clienteId: Number(dados.clienteId),
            categoriaId: Number(dados.categoriaId),
            tecnicoId: dados.tecnicoId ? Number(dados.tecnicoId) : null,
          },
        });
        avisar("Chamado aberto.");
        location.hash = "#/chamados";
      } catch (e) {
        avisar(e.message, true);
      }
    });
}

async function telaChamadoDetalhe(id) {
  const [c, comentarios, tecnicos] = await Promise.all([
    api(`/chamados/${id}`),
    api(`/chamados/${id}/comentarios`),
    api("/tecnicos"),
  ]);
  const fechado = c.status === "FECHADO";
  const outrosStatus = STATUS.filter((s) => s !== c.status);

  app.innerHTML = `
    <div class="cabecalho">
      <h1>#${c.id} · ${esc(c.titulo)}</h1>
      <a class="botao" href="#/chamados">Voltar</a>
    </div>
    <div class="grade-2">
      <div class="card">
        <dl class="dados">
          <dt>Status</dt><dd>${seloStatus(c.status)}</dd>
          <dt>Prioridade</dt><dd>${seloPrioridade(c.prioridade)}</dd>
          <dt>Cliente</dt><dd><a href="#/clientes/${c.clienteId}">${esc(c.clienteNome)}</a></dd>
          <dt>Categoria</dt><dd>${esc(c.categoriaNome)}</dd>
          <dt>Técnico</dt><dd>${esc(c.tecnicoNome) || "—"}</dd>
          <dt>Abertura</dt><dd>${dataHora(c.dataAbertura)}</dd>
          <dt>Fechamento</dt><dd>${dataHora(c.dataFechamento)}</dd>
        </dl>
        <h2 style="margin-top:16px">Descrição</h2>
        <p class="descricao">${esc(c.descricao)}</p>
      </div>
      <div>
        ${
          fechado
            ? '<div class="card vazio">Chamado fechado: status e técnico não podem mais ser alterados.</div>'
            : `
        <form class="card" id="form-status">
          <h2>Alterar status</h2>
          <div class="filtros">
            <label>Novo status
              <select name="status" required>${opcoes(outrosStatus.map((s) => ({ valor: s, texto: rotulo(s) })), "")}</select>
            </label>
            <button class="primario" type="submit">Alterar</button>
          </div>
        </form>
        <form class="card" id="form-tecnico">
          <h2>Atribuir técnico</h2>
          <div class="filtros">
            <label>Técnico
              <select name="tecnicoId" required>${opcoes(tecnicos.map((t) => ({ valor: t.id, texto: t.nome })), c.tecnicoId, "Selecione")}</select>
            </label>
            <button class="primario" type="submit">Atribuir</button>
          </div>
        </form>`
        }
      </div>
    </div>
    <div class="card">
      <h2>Comentários</h2>
      ${
        comentarios.length === 0
          ? '<p class="vazio">Nenhum comentário ainda.</p>'
          : comentarios
              .map(
                (m) => `
        <div class="comentario">
          <div class="meta">${esc(m.autor)} · ${dataHora(m.data)}</div>
          <div class="descricao">${esc(m.texto)}</div>
        </div>`,
              )
              .join("")
      }
      <form id="form-comentario" style="margin-top:16px">
        <div class="campos">
          <label>Autor *<input name="autor" required maxlength="100"></label>
          <label class="largo">Comentário *<textarea name="texto" required maxlength="1000"></textarea></label>
        </div>
        <div class="linha-botoes">
          <button class="primario" type="submit">Comentar</button>
        </div>
      </form>
    </div>`;

  const enviar = (seletor, montar) => {
    const form = document.getElementById(seletor);
    if (!form) return;
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      try {
        const [caminho, metodo, corpo, msg] = montar(dadosDoForm(ev.target));
        await api(caminho, { method: metodo, body: corpo });
        avisar(msg);
        telaChamadoDetalhe(id);
      } catch (e) {
        avisar(e.message, true);
      }
    });
  };

  enviar("form-status", (d) => [
    `/chamados/${id}/status`,
    "PATCH",
    { status: d.status },
    "Status alterado.",
  ]);
  enviar("form-tecnico", (d) => [
    `/chamados/${id}/atribuir`,
    "PATCH",
    { tecnicoId: Number(d.tecnicoId) },
    "Técnico atribuído.",
  ]);
  enviar("form-comentario", (d) => [
    `/chamados/${id}/comentarios`,
    "POST",
    d,
    "Comentário adicionado.",
  ]);
}
