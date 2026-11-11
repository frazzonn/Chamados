const PERFIS = ["TECNICO", "ADMIN"];

async function telaTecnicos(id) {
  const tecnicos = await api("/tecnicos");
  const atual = id
    ? await api(`/tecnicos/${id}`)
    : { nome: "", email: "", perfil: "TECNICO" };

  app.innerHTML = `
    <div class="cabecalho"><h1>Técnicos</h1></div>
    <div class="grade-2">
      <form class="card" id="form-tecnico">
        <h2>${id ? "Editar técnico" : "Novo técnico"}</h2>
        <div class="campos">
          <label class="largo">Nome *<input name="nome" required maxlength="100" value="${esc(atual.nome)}"></label>
          <label class="largo">E-mail *<input name="email" type="email" required value="${esc(atual.email)}"></label>
          <label class="largo">Perfil *
            <select name="perfil" required>
              ${PERFIS.map((p) => `<option value="${p}" ${p === atual.perfil ? "selected" : ""}>${p}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="linha-botoes">
          <button class="primario" type="submit">Salvar</button>
          ${id ? '<a class="botao" href="#/tecnicos">Cancelar</a>' : ""}
        </div>
      </form>
      <div class="card tabela">
        <h2>Cadastrados</h2>
        ${
          tecnicos.length === 0
            ? '<p class="vazio">Nenhum técnico cadastrado.</p>'
            : `
        <table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th></th></tr></thead>
          <tbody>
            ${tecnicos
              .map(
                (t) => `
              <tr>
                <td>${esc(t.nome)}</td>
                <td>${esc(t.email)}</td>
                <td>${esc(t.perfil)}</td>
                <td class="acoes">
                  <a class="botao pequeno" href="#/tecnicos/${t.id}/editar">Editar</a>
                  <button class="pequeno perigo" data-excluir="${t.id}">Excluir</button>
                </td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>`
        }
      </div>
    </div>`;

  const recarregar = () =>
    id ? (location.hash = "#/tecnicos") : telaTecnicos(null);

  document
    .getElementById("form-tecnico")
    .addEventListener("submit", async (ev) => {
      ev.preventDefault();
      try {
        await api(id ? `/tecnicos/${id}` : "/tecnicos", {
          method: id ? "PUT" : "POST",
          body: dadosDoForm(ev.target),
        });
        avisar("Técnico salvo.");
        recarregar();
      } catch (e) {
        avisar(e.message, true);
      }
    });

  app.querySelectorAll("[data-excluir]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Excluir este técnico?")) return;
      try {
        await api(`/tecnicos/${btn.dataset.excluir}`, { method: "DELETE" });
        avisar("Técnico excluído.");
        recarregar();
      } catch (e) {
        avisar(e.message, true);
      }
    }),
  );
}
