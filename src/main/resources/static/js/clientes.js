async function telaClientesLista() {
  const clientes = await api("/clientes");
  app.innerHTML = `
    <div class="cabecalho">
      <h1>Clientes</h1>
      <a class="botao primario" href="#/clientes/novo">Novo cliente</a>
    </div>
    <div class="card tabela">
      ${
        clientes.length === 0
          ? '<p class="vazio">Nenhum cliente cadastrado.</p>'
          : `
      <table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th></th></tr></thead>
        <tbody>
          ${clientes
            .map(
              (c) => `
            <tr>
              <td><a href="#/clientes/${c.id}">${esc(c.nome)}</a></td>
              <td>${esc(c.email)}</td>
              <td>${esc(c.telefone)}</td>
              <td class="acoes">
                <a class="botao pequeno" href="#/clientes/${c.id}/editar">Editar</a>
                <button class="pequeno perigo" data-excluir="${c.id}">Excluir</button>
              </td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>`
      }
    </div>`;

  app.querySelectorAll("[data-excluir]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Excluir este cliente?")) return;
      try {
        await api(`/clientes/${btn.dataset.excluir}`, { method: "DELETE" });
        avisar("Cliente excluído.");
        telaClientesLista();
      } catch (e) {
        avisar(e.message, true);
      }
    }),
  );
}

async function telaClientesForm(id) {
  const cliente = id
    ? await api(`/clientes/${id}`)
    : { nome: "", email: "", telefone: "" };
  app.innerHTML = `
    <div class="cabecalho"><h1>${id ? "Editar cliente" : "Novo cliente"}</h1></div>
    <form class="card" id="form-cliente">
      <div class="campos">
        <label>Nome *<input name="nome" required maxlength="100" value="${esc(cliente.nome)}"></label>
        <label>E-mail *<input name="email" type="email" required value="${esc(cliente.email)}"></label>
        <label>Telefone<input name="telefone" maxlength="20" value="${esc(cliente.telefone)}"></label>
      </div>
      <div class="linha-botoes">
        <button class="primario" type="submit">Salvar</button>
        <a class="botao" href="${id ? `#/clientes/${id}` : "#/clientes"}">Cancelar</a>
      </div>
    </form>`;

  document
    .getElementById("form-cliente")
    .addEventListener("submit", async (ev) => {
      ev.preventDefault();
      try {
        const salvo = await api(id ? `/clientes/${id}` : "/clientes", {
          method: id ? "PUT" : "POST",
          body: dadosDoForm(ev.target),
        });
        avisar("Cliente salvo.");
        location.hash = `#/clientes/${salvo.id}`;
      } catch (e) {
        avisar(e.message, true);
      }
    });
}

async function telaClientesDetalhe(id) {
  const c = await api(`/clientes/${id}`);
  app.innerHTML = `
    <div class="cabecalho">
      <h1>${esc(c.nome)}</h1>
      <div class="linha-botoes" style="margin:0">
        <a class="botao" href="#/clientes">Voltar</a>
        <a class="botao" href="#/chamados?clienteId=${c.id}">Chamados do cliente</a>
        <a class="botao primario" href="#/clientes/${c.id}/editar">Editar</a>
      </div>
    </div>
    <div class="card">
      <dl class="dados">
        <dt>Código</dt><dd>${c.id}</dd>
        <dt>E-mail</dt><dd>${esc(c.email)}</dd>
        <dt>Telefone</dt><dd>${esc(c.telefone) || "—"}</dd>
      </dl>
    </div>`;
}
