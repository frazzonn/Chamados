const app = document.getElementById("app");

function esc(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function api(caminho, opcoes = {}) {
  const resp = await fetch(caminho, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
  });
  if (resp.status === 204) return null;
  const dados = await resp.json().catch(() => null);
  if (!resp.ok) {
    let msg = dados?.erro || `Erro ${resp.status}`;
    if (dados?.detalhes?.length) msg += "\n" + dados.detalhes.join("\n");
    throw new Error(msg);
  }
  return dados;
}

let timerAviso;
function avisar(msg, erro = false) {
  const el = document.getElementById("aviso");
  el.textContent = msg;
  el.className = "aviso" + (erro ? " erro" : "");
  el.hidden = false;
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => (el.hidden = true), erro ? 6000 : 3000);
}

function dadosDoForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}
