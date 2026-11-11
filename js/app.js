/* ==========================================================
   RGA — Registro Geral Animal
   Lógica da aplicação (JavaScript puro, sem bibliotecas)
   ========================================================== */

const CHAVE_STORAGE = "rga_animais";
const EMOJI_ESPECIE = {
  "Cão": "🐶", "Gato": "🐱", "Ave": "🐦", "Coelho": "🐰",
  "Roedor": "🐹", "Réptil": "🦎", "Outro": "🐾",
};

let animais = carregar();
let fotoAtual = null;     // dataURL da foto no formulário
let animalAberto = null;  // animal exibido no modal

/* ---------------- Armazenamento (localStorage) ---------------- */
function carregar() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || [];
  } catch {
    return [];
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(animais));
    return true;
  } catch {
    mostrarToast("Não foi possível salvar: armazenamento cheio ou bloqueado.");
    return false;
  }
}

/* ---------------- Utilidades ---------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function formatarData(iso) {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function hojeISO() {
  const h = new Date();
  h.setMinutes(h.getMinutes() - h.getTimezoneOffset());
  return h.toISOString().slice(0, 10);
}

function calcularIdade(iso) {
  const nasc = new Date(iso + "T00:00:00");
  const hoje = new Date();
  let meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
  if (hoje.getDate() < nasc.getDate()) meses--;
  if (meses < 0) return "—";
  if (meses < 12) return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  const anos = Math.floor(meses / 12);
  return `${anos} ${anos === 1 ? "ano" : "anos"}`;
}

/* Gera número de RG no formato 000.000.000-D com dígito verificador (módulo 11) */
function gerarNumeroRG() {
  let numero;
  do {
    const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
    const soma = base.reduce((acc, dig, i) => acc + dig * (10 - i), 0);
    const resto = soma % 11;
    const dv = resto < 2 ? 0 : 11 - resto;
    const s = base.join("");
    numero = `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${dv}`;
  } while (animais.some((a) => a.rg === numero));
  return numero;
}

/* Valida CPF pelos dígitos verificadores */
function cpfValido(cpf) {
  const n = cpf.replace(/\D/g, "");
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  const calc = (len) => {
    let soma = 0;
    for (let i = 0; i < len; i++) soma += Number(n[i]) * (len + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(n[9]) && calc(10) === Number(n[10]);
}

/* Máscaras de digitação */
function mascaraCPF(v) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function mascaraTelefone(v) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function mostrarToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ---------------- Navegação entre telas ---------------- */
function irPara(tela) {
  $$(".tela").forEach((s) => s.classList.toggle("ativa", s.id === tela));
  $$(".menu-item").forEach((b) => b.classList.toggle("ativo", b.dataset.tela === tela));
  if (tela === "consulta") renderizarLista();
  if (tela === "inicio") atualizarEstatisticas();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$$(".menu-item").forEach((b) => b.addEventListener("click", () => irPara(b.dataset.tela)));
$$("[data-ir]").forEach((b) => b.addEventListener("click", () => irPara(b.dataset.ir)));

/* ---------------- Estatísticas ---------------- */
function atualizarEstatisticas() {
  $("#stat-total").textContent = animais.length;
  $("#stat-caes").textContent = animais.filter((a) => a.especie === "Cão").length;
  $("#stat-gatos").textContent = animais.filter((a) => a.especie === "Gato").length;
  $("#stat-vacinas").textContent = animais.reduce((t, a) => t + a.vacinas.length, 0);
}

/* ---------------- Formulário ---------------- */
const form = $("#form-animal");
const inputFoto = $("#foto");
const previewFoto = $("#foto-preview");

form.nascimento.max = hojeISO();
form.cpf.addEventListener("input", (e) => (e.target.value = mascaraCPF(e.target.value)));
form.telefone.addEventListener("input", (e) => (e.target.value = mascaraTelefone(e.target.value)));
form.microchip.addEventListener("input", (e) => (e.target.value = e.target.value.replace(/\D/g, "").slice(0, 15)));

/* Foto: redimensiona para no máx. 400px para não lotar o localStorage */
inputFoto.addEventListener("change", () => {
  const arquivo = inputFoto.files[0];
  if (!arquivo) return;
  const leitor = new FileReader();
  leitor.onload = () => {
    const img = new Image();
    img.onload = () => {
      const max = 400;
      const escala = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      fotoAtual = canvas.toDataURL("image/jpeg", 0.8);
      previewFoto.style.backgroundImage = `url(${fotoAtual})`;
      previewFoto.classList.add("com-foto");
    };
    img.src = leitor.result;
  };
  leitor.readAsDataURL(arquivo);
});

/* Vacinas dinâmicas */
const listaVacinasForm = $("#lista-vacinas-form");

function adicionarLinhaVacina(dados = {}) {
  const linha = document.createElement("div");
  linha.className = "linha-vacina";
  linha.innerHTML = `
    <input placeholder="Nome da vacina (ex.: V10, Antirrábica)" class="v-nome" maxlength="40" value="${escapar(dados.nome)}">
    <input type="date" class="v-data" title="Data da aplicação" value="${escapar(dados.data)}" max="${hojeISO()}">
    <input type="date" class="v-proxima" title="Próxima dose" value="${escapar(dados.proxima)}">
    <button type="button" class="remover" aria-label="Remover vacina">×</button>`;
  linha.querySelector(".remover").addEventListener("click", () => linha.remove());
  listaVacinasForm.appendChild(linha);
}

$("#add-vacina").addEventListener("click", () => adicionarLinhaVacina());

function limparFormulario() {
  fotoAtual = null;
  inputFoto.value = "";
  previewFoto.style.backgroundImage = "";
  previewFoto.classList.remove("com-foto");
  listaVacinasForm.innerHTML = `<div class="rotulos-vacina">Nome · Data da aplicação · Próxima dose</div>`;
  adicionarLinhaVacina();
  $("#erro-form").textContent = "";
  $$(".campo.invalido").forEach((c) => c.classList.remove("invalido"));
}

form.addEventListener("reset", () => setTimeout(limparFormulario));

form.addEventListener("submit", (e) => {
  e.preventDefault();
  $$(".campo.invalido").forEach((c) => c.classList.remove("invalido"));

  const erros = [];
  form.querySelectorAll("[required]").forEach((campo) => {
    if (!campo.value.trim()) {
      campo.closest(".campo").classList.add("invalido");
      erros.push("campo");
    }
  });
  if (erros.length) {
    $("#erro-form").textContent = "Preencha os campos obrigatórios destacados.";
    return;
  }
  if (!cpfValido(form.cpf.value)) {
    form.cpf.closest(".campo").classList.add("invalido");
    $("#erro-form").textContent = "CPF inválido. Confira os números digitados.";
    return;
  }
  if (form.microchip.value && form.microchip.value.length !== 15) {
    form.microchip.closest(".campo").classList.add("invalido");
    $("#erro-form").textContent = "O número do microchip deve ter 15 dígitos.";
    return;
  }

  const vacinas = [...listaVacinasForm.querySelectorAll(".linha-vacina")]
    .map((l) => ({
      nome: l.querySelector(".v-nome").value.trim(),
      data: l.querySelector(".v-data").value,
      proxima: l.querySelector(".v-proxima").value,
    }))
    .filter((v) => v.nome);

  const f = form.elements;
  const animal = {
    id: Date.now().toString(36),
    rg: gerarNumeroRG(),
    emissao: hojeISO(),
    foto: fotoAtual,
    nome: f.nome.value.trim(),
    especie: f.especie.value,
    raca: f.raca.value.trim() || "SRD",
    sexo: f.sexo.value,
    nascimento: f.nascimento.value,
    pelagem: f.pelagem.value.trim(),
    porte: f.porte.value,
    peso: f.peso.value,
    microchip: f.microchip.value,
    castrado: f.castrado.checked,
    observacoes: f.observacoes.value.trim(),
    tutor: f.tutor.value.trim(),
    cpf: f.cpf.value,
    telefone: f.telefone.value,
    email: f.email.value.trim(),
    cidade: f.cidade.value.trim(),
    endereco: f.endereco.value.trim(),
    vacinas,
  };

  animais.push(animal);
  if (!salvar()) { animais.pop(); return; }

  form.reset();
  mostrarToast(`RG animal de ${animal.nome} emitido com sucesso!`);
  abrirDocumento(animal);
});

/* ---------------- Consulta ---------------- */
function renderizarLista() {
  const termo = $("#busca").value.trim().toLowerCase();
  const termoDigitos = termo.replace(/\D/g, "");
  const especie = $("#filtro-especie").value;

  const filtrados = animais.filter((a) => {
    if (especie && a.especie !== especie) return false;
    if (!termo) return true;
    return (
      a.nome.toLowerCase().includes(termo) ||
      a.tutor.toLowerCase().includes(termo) ||
      (termoDigitos && (a.rg.replace(/\D/g, "").includes(termoDigitos) ||
                        a.cpf.replace(/\D/g, "").includes(termoDigitos)))
    );
  });

  const lista = $("#lista-animais");
  if (!filtrados.length) {
    lista.innerHTML = `<div class="vazio"><img class="logo-vazio" src="img/logo-rga.png" alt="">${
      animais.length ? "Nenhum animal encontrado com esses filtros." : "Nenhum animal cadastrado ainda. Que tal emitir o primeiro RG? 🐾"
    }</div>`;
    return;
  }

  lista.innerHTML = filtrados.map((a) => `
    <button class="item-animal" data-id="${a.id}">
      <div class="capa" style="${a.foto ? `background-image:url(${a.foto})` : ""}">${a.foto ? "" : EMOJI_ESPECIE[a.especie]}</div>
      <div class="info">
        <h3>${escapar(a.nome)}</h3>
        <div class="rg-num">RG ${a.rg}</div>
        <p>${escapar(a.especie)} · ${escapar(a.raca)} · ${calcularIdade(a.nascimento)}</p>
        <p>Tutor: ${escapar(a.tutor)}</p>
      </div>
    </button>`).join("");

  lista.querySelectorAll(".item-animal").forEach((el) =>
    el.addEventListener("click", () => abrirDocumento(animais.find((a) => a.id === el.dataset.id))));
}

$("#busca").addEventListener("input", renderizarLista);
$("#filtro-especie").addEventListener("change", renderizarLista);

/* ---------------- Documento (RG) ---------------- */
const LOGO_DOC = `<span class="selo-logo selo-pequeno"><img src="img/logo-rga.png" alt="RGA"></span>`;

/* Código de barras decorativo gerado a partir do número do RG */
function codigoBarras(rg) {
  const digitos = rg.replace(/\D/g, "");
  let barras = "";
  for (const d of digitos + digitos.split("").reverse().join("")) {
    const n = Number(d);
    barras += `<i style="width:${(n % 3) + 1}px"></i><i style="width:1px;background:transparent"></i>`;
  }
  return `<div class="codigo-barras">${barras}</div>`;
}

function dado(rotulo, valor, classe = "") {
  return `<div class="rg-dado ${classe}"><label>${rotulo}</label><span>${escapar(valor || "—")}</span></div>`;
}

function statusVacina(v) {
  if (!v.proxima) return `<span class="status sem">Sem reforço</span>`;
  return v.proxima < hojeISO()
    ? `<span class="status atrasada">Reforço atrasado</span>`
    : `<span class="status ok">Em dia</span>`;
}

function abrirDocumento(a) {
  animalAberto = a;
  const foto = a.foto ? `style="background-image:url(${a.foto})"` : "";
  const fotoEmoji = a.foto ? "" : EMOJI_ESPECIE[a.especie];

  $("#documento").innerHTML = `
    <!-- FRENTE -->
    <div class="rg">
      <div class="rg-cabecalho">
        ${LOGO_DOC}
        <div style="flex:1">
          <strong>REGISTRO GERAL ANIMAL</strong>
          <small>Carteira de identidade animal</small>
        </div>
        <span class="rg-lado">FRENTE</span>
      </div>
      <div class="rg-corpo">
        <div class="rg-foto" ${foto}>${fotoEmoji}</div>
        <div class="rg-dados">
          <div class="rg-dado full"><label>Nº do registro</label><span class="rg-numero">${a.rg}</span></div>
          ${dado("Nome", a.nome, "full")}
          ${dado("Espécie", a.especie)}
          ${dado("Raça", a.raca)}
          ${dado("Sexo", a.sexo)}
          ${dado("Nascimento", formatarData(a.nascimento) + " (" + calcularIdade(a.nascimento) + ")")}
          ${dado("Pelagem", a.pelagem)}
          ${dado("Porte", a.porte + (a.peso ? ` · ${a.peso} kg` : ""))}
        </div>
      </div>
      <div class="rg-rodape">
        <span>Emitido em ${formatarData(a.emissao)}</span>
        ${codigoBarras(a.rg)}
      </div>
    </div>

    <!-- VERSO -->
    <div class="rg">
      <div class="rg-cabecalho">
        ${LOGO_DOC}
        <div style="flex:1">
          <strong>DADOS COMPLEMENTARES</strong>
          <small>Tutor responsável e saúde</small>
        </div>
        <span class="rg-lado">VERSO</span>
      </div>
      <div class="rg-corpo" style="grid-template-columns:1fr">
        <div class="rg-dados">
          ${dado("Tutor responsável", a.tutor, "full")}
          ${dado("CPF do tutor", a.cpf)}
          ${dado("Telefone", a.telefone)}
          ${dado("Cidade / UF", a.cidade)}
          ${dado("E-mail", a.email)}
          ${dado("Endereço", a.endereco, "full")}
          ${dado("Microchip", a.microchip || "Não possui")}
          ${dado("Castrado(a)", a.castrado ? "Sim" : "Não")}
          ${dado("Observações", a.observacoes || "Nenhuma", "full")}
        </div>
      </div>
      <div class="rg-rodape">
        <span>Em caso de perda, contate o tutor responsável.</span>
        <span>RG ${a.rg}</span>
      </div>
    </div>

    <!-- CARTEIRA DE VACINAÇÃO -->
    <div class="carteira-vacina">
      <h3>💉 Carteira de vacinação</h3>
      ${a.vacinas.length ? `
        <table class="tabela">
          <thead><tr><th>Vacina</th><th>Aplicação</th><th>Próxima dose</th><th>Situação</th></tr></thead>
          <tbody>
            ${a.vacinas.map((v) => `
              <tr>
                <td>${escapar(v.nome)}</td>
                <td>${formatarData(v.data)}</td>
                <td>${formatarData(v.proxima)}</td>
                <td>${statusVacina(v)}</td>
              </tr>`).join("")}
          </tbody>
        </table>` : `<p class="vazio">Nenhuma vacina registrada.</p>`}
    </div>`;

  $("#modal").showModal();
}

$("#fechar-modal").addEventListener("click", () => $("#modal").close());
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") $("#modal").close(); });
$("#btn-imprimir").addEventListener("click", () => window.print());
$("#btn-excluir").addEventListener("click", () => {
  if (!animalAberto) return;
  if (!confirm(`Excluir o cadastro de ${animalAberto.nome}? Esta ação não pode ser desfeita.`)) return;
  animais = animais.filter((a) => a.id !== animalAberto.id);
  salvar();
  $("#modal").close();
  mostrarToast("Cadastro excluído.");
  renderizarLista();
  atualizarEstatisticas();
});

/* ---------------- Inicialização ---------------- */
limparFormulario();
atualizarEstatisticas();
