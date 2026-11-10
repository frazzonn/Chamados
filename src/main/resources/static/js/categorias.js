async function telaCategorias(id) {
  const categorias = await api("/categorias");
  const atual = id
    ? await api(`/categorias/${id}`)
    : { nome: "", descricao: "" };

  app.innerHTML = `
    <div class="cabecalho"><h1>Categorias</h1></div>
    <div class="grade-2">
      <form class="card" id="form-categoria">
        <h2>${id ? "Editar categoria" : "Nova categoria"}</h2>
        <div class="campos">
          <label class="largo">Nome *<input name="nome" required maxlength="100" value="${esc(atual.nome)}"></label>
          <label class="largo">Descrição<textarea name="descricao" maxlength="255">${esc(atual.descricao)}</textarea></label>
        </div>
        <div class="linha-botoes">
          <button class="primario" type="submit">Salvar</button>
          ${id ? '<a class="botao" href="#/categorias">Cancelar</a>' : ""}
        </div>
      </form>
      <div class="card tabela">
        <h2>Cadastradas</h2>
        ${
          categorias.length === 0
            ? '<p class="vazio">Nenhuma categoria cadastrada.</p>'
            : `
        <table>
          <thead><tr><th>Nome</th><th>Descrição</th><th></th></tr></thead>
          <tbody>
            ${categorias
              .map(
                (c) => `
              <tr>
                <td>${esc(c.nome)}</td>
                <td>${esc(c.descricao)}</td>
                <td class="acoes">
                  <a class="botao pequeno" href="#/categorias/${c.id}/editar">Editar</a>
                  <button class="pequeno perigo" data-excluir="${c.id}">Excluir</button>
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
    id ? (location.hash = "#/categorias") : telaCategorias(null);

  document
    .getElementById("form-categoria")
    .addEventListener("submit", async (ev) => {
      ev.preventDefault();
      try {
        await api(id ? `/categorias/${id}` : "/categorias", {
          method: id ? "PUT" : "POST",
          body: dadosDoForm(ev.target),
        });
        avisar("Categoria salva.");
        recarregar();
      } catch (e) {
        avisar(e.message, true);
      }
    });

  app.querySelectorAll("[data-excluir]").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Excluir esta categoria?")) return;
      try {
        await api(`/categorias/${btn.dataset.excluir}`, { method: "DELETE" });
        avisar("Categoria excluída.");
        recarregar();
      } catch (e) {
        avisar(e.message, true);
      }
    }),
  );
}
