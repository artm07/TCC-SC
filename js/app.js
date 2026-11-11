/* ==========================================================
   RGA — Registro Geral Animal
   Lógica do aplicativo (JavaScript puro, sem bibliotecas)

   Telas (seguindo o mapa mental):
   Login → Início (menu ≡) → RGA | Marque sua consulta | Notícias
   | Cuidados | Adoção | Ajuda (dúvidas frequentes) | Sair
   ========================================================== */

const NATIVO = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

/* ---------------- Armazenamento (localStorage) ---------------- */
function ler(chave, padrao) {
  try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; } catch { return padrao; }
}
function gravar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); return true; }
  catch { toast("Não foi possível salvar: armazenamento cheio ou bloqueado."); return false; }
}

let usuarios = ler("rga_usuarios", []);
let animais = ler("rga_animais", []);
let consultas = ler("rga_consultas", []);
let interesses = ler("rga_interesses", []);
let duvidasEnviadas = ler("rga_duvidas", []);
let usuario = usuarios.find((u) => u.id === ler("rga_sessao", null)) || null;

/* ---------------- Utilidades ---------------- */
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const conteudo = $("#conteudo");
const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

function escapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

function isoDe(data) {
  const d = new Date(data);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
const hojeISO = () => isoDe(new Date());

function formatarData(iso) {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
  "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
function dataPorExtenso(iso) {
  const d = new Date(iso + "T00:00:00");
  return `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

function calcularIdade(iso) {
  if (!iso) return "—";
  const nasc = new Date(iso + "T00:00:00");
  const hoje = new Date();
  let meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
  if (hoje.getDate() < nasc.getDate()) meses--;
  if (meses < 0) return "—";
  if (meses < 12) return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  const anos = Math.floor(meses / 12);
  return `${anos} ${anos === 1 ? "ano" : "anos"}`;
}

/* Número do RG no formato 000.000.000-D com dígito verificador (módulo 11) */
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

const soDigitos = (v) => String(v || "").replace(/\D/g, "");
function mascaraCPF(v) {
  return soDigitos(v).slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function mascaraTelefone(v) {
  const n = soDigitos(v).slice(0, 11);
  if (n.length <= 10) return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return n.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}
function aplicarMascaras(raiz) {
  $$('input[name="cpf"]', raiz).forEach((i) => i.addEventListener("input", () => (i.value = mascaraCPF(i.value))));
  $$('input[name="telefone"]', raiz).forEach((i) => i.addEventListener("input", () => (i.value = mascaraTelefone(i.value))));
}

/* Protótipo: a senha é guardada embaralhada, mas isto NÃO é segurança de verdade
   (num sistema real, as senhas ficariam num servidor, com criptografia própria). */
function embaralharSenha(senha, sal) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (const c of sal + ":" + senha) {
    const k = c.charCodeAt(0);
    h1 = Math.imul(h1 ^ k, 2654435761);
    h2 = Math.imul(h2 ^ k, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16);
}

function acharUsuario(login) {
  const l = login.trim().toLowerCase();
  const d = soDigitos(l);
  return usuarios.find((u) => u.email.toLowerCase() === l || (d.length === 11 && soDigitos(u.cpf) === d));
}

function toast(msg) {
  $$(".toast").forEach((t) => t.remove());
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

function erroEm(form, msg, campo) {
  $$(".campo.invalido", form).forEach((c) => c.classList.remove("invalido"));
  if (campo) form.elements[campo]?.closest(".campo")?.classList.add("invalido");
  $(".erro", form).textContent = msg;
  return false;
}

function abrirModal(html) {
  $("#modal-corpo").innerHTML = html;
  $("#modal").showModal();
}
const fecharModal = () => $("#modal").open && $("#modal").close();
$("#fechar-modal").addEventListener("click", fecharModal);
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") fecharModal(); });

/* Dados do usuário logado */
const meusAnimais = () => animais.filter((a) => a.dono === usuario.id || (!a.dono && soDigitos(a.cpf) === soDigitos(usuario.cpf)));
const minhasConsultas = () => consultas
  .filter((c) => c.dono === usuario.id)
  .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
const consultasFuturas = () => minhasConsultas().filter((c) => c.data >= hojeISO());

/* ==========================================================
   LOGIN, CRIAR CONTA E ESQUECI A SENHA
   ========================================================== */
const formsAuth = { login: $("#form-login"), conta: $("#form-conta"), esqueci: $("#form-esqueci") };

function mostrarAuth(qual = "login") {
  Object.entries(formsAuth).forEach(([nome, f]) => {
    f.hidden = nome !== qual;
    $(".erro", f).textContent = "";
    $$(".campo.invalido", f).forEach((c) => c.classList.remove("invalido"));
  });
  $("#tela-login").hidden = false;
  $("#app").hidden = true;
}
$$("[data-auth]").forEach((b) => b.addEventListener("click", () => mostrarAuth(b.dataset.auth)));
aplicarMascaras($("#tela-login"));

formsAuth.login.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const u = acharUsuario(f.login.value);
  if (!f.login.value.trim()) return erroEm(f, "Informe seu CPF ou e-mail.", "login");
  if (!u) return erroEm(f, "Não encontramos uma conta com esse CPF ou e-mail.", "login");
  if (u.senha !== embaralharSenha(f.senha.value, u.id)) return erroEm(f, "Senha incorreta.", "senha");
  f.reset();
  entrar(u);
});

formsAuth.conta.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const v = (n) => f.elements[n].value.trim();
  if (!v("nome")) return erroEm(f, "Informe seu nome.", "nome");
  if (!cpfValido(v("cpf"))) return erroEm(f, "CPF inválido.", "cpf");
  if (soDigitos(v("telefone")).length < 10) return erroEm(f, "Telefone incompleto.", "telefone");
  if (!/^\S+@\S+\.\S+$/.test(v("email"))) return erroEm(f, "E-mail inválido.", "email");
  if (!v("cidade")) return erroEm(f, "Informe sua cidade.", "cidade");
  if (f.senha.value.length < 6) return erroEm(f, "A senha precisa ter pelo menos 6 caracteres.", "senha");
  if (f.senha.value !== f.senha2.value) return erroEm(f, "As senhas não são iguais.", "senha2");
  if (acharUsuario(v("email")) || acharUsuario(v("cpf"))) return erroEm(f, "Já existe uma conta com esse CPF ou e-mail.");

  const id = novoId();
  const u = {
    id, nome: v("nome"), cpf: v("cpf"), telefone: v("telefone"), email: v("email").toLowerCase(),
    cidade: v("cidade"), senha: embaralharSenha(f.senha.value, id),
  };
  usuarios.push(u);
  if (!gravar("rga_usuarios", usuarios)) { usuarios.pop(); return; }
  f.reset();
  toast(`Bem-vindo(a), ${u.nome.split(" ")[0]}! Conta criada.`);
  entrar(u);
});

formsAuth.esqueci.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const u = acharUsuario(f.login.value);
  if (!u) return erroEm(f, "Não encontramos uma conta com esse CPF ou e-mail.", "login");
  if (soDigitos(u.telefone) !== soDigitos(f.telefone.value)) return erroEm(f, "O telefone não confere com o cadastro.", "telefone");
  if (f.senha.value.length < 6) return erroEm(f, "A senha precisa ter pelo menos 6 caracteres.", "senha");
  u.senha = embaralharSenha(f.senha.value, u.id);
  gravar("rga_usuarios", usuarios);
  f.reset();
  mostrarAuth("login");
  toast("Senha alterada. Entre com a senha nova.");
});

function entrar(u) {
  usuario = u;
  gravar("rga_sessao", u.id);
  // Animais antigos (versão sem login) passam a pertencer ao tutor com o mesmo CPF
  let mudou = false;
  animais.forEach((a) => {
    if (!a.dono && soDigitos(a.cpf) === soDigitos(u.cpf)) { a.dono = u.id; mudou = true; }
  });
  if (mudou) gravar("rga_animais", animais);

  $("#tela-login").hidden = true;
  $("#app").hidden = false;
  $("#topo-ola").textContent = `Olá, ${u.nome.split(" ")[0]}`;
  $("#menu-nome").textContent = u.nome;
  $("#menu-email").textContent = u.email;
  if (location.hash.length < 2) location.hash = "#inicio";
  else renderizar();
  iniciarChat();
}

function sair() {
  if (!confirm("Deseja sair da sua conta?")) return;
  usuario = null;
  gravar("rga_sessao", null);
  fecharMenu();
  $("#chat").hidden = true;
  history.replaceState(null, "", location.pathname);
  mostrarAuth("login");
}

/* ==========================================================
   MENU LATERAL (≡) E NAVEGAÇÃO
   ========================================================== */
const ITENS_MENU = [{ rota: "inicio", titulo: "Início", icone: "inicio" }, ...ATALHOS,
  { rota: "ajuda", titulo: "Ajuda", icone: "ajuda" }];

$("#abrir-menu").innerHTML = icone("menu");
$("#chat-enviar").innerHTML = icone("enviar");
$$(".gato").forEach((g) => (g.innerHTML = icone("gato")));
$("#btn-sair").innerHTML = `${icone("sair")}<span>Sair</span>`;
$("#menu-links").innerHTML = ITENS_MENU.map((i) =>
  `<a class="menu-link" href="#${i.rota}" data-rota="${i.rota}">${icone(i.icone)}<span>${i.titulo}</span></a>`).join("");

function abrirMenu() { document.body.classList.add("menu-aberto"); $("#fundo-menu").hidden = false; }
function fecharMenu() { document.body.classList.remove("menu-aberto"); $("#fundo-menu").hidden = true; }
$("#abrir-menu").addEventListener("click", () =>
  document.body.classList.contains("menu-aberto") ? fecharMenu() : abrirMenu());
$("#fundo-menu").addEventListener("click", fecharMenu);
$("#btn-sair").addEventListener("click", sair);

const ROTAS = {
  inicio: telaInicio, rga: telaRgaLista, "novo-rga": telaNovoRga, consultas: telaConsultas,
  marcar: telaMarcar, noticias: telaNoticias, cuidados: telaCuidados, adocao: telaAdocao, ajuda: telaAjuda,
};

function renderizar() {
  if (!usuario) return mostrarAuth("login");
  const [rota, param] = location.hash.slice(1).split("/");
  fecharMenu();
  fecharModal();
  if (rota === "rga" && param) telaRgaDetalhe(param);
  else (ROTAS[rota] || telaInicio)();
  const ativa = rota === "novo-rga" ? "rga" : rota === "marcar" ? "consultas" : rota || "inicio";
  $$(".menu-link[data-rota]").forEach((l) => l.classList.toggle("ativo", l.dataset.rota === ativa));
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", renderizar);

const cabecalho = (titulo, subtitulo = "", acao = "") => `
  <div class="cabecalho-tela">
    <div><h1>${titulo}</h1>${subtitulo ? `<p>${subtitulo}</p>` : ""}</div>
    ${acao}
  </div>`;

/* ==========================================================
   INÍCIO
   ========================================================== */
function telaInicio() {
  const prox = consultasFuturas()[0];
  const animalProx = prox && animais.find((a) => a.id === prox.animalId);

  conteudo.innerHTML = `
    ${cabecalho(`Olá, ${escapar(usuario.nome.split(" ")[0])}!`, "O que você precisa hoje?")}

    ${prox ? `
      <a class="aviso-consulta" href="#consultas">
        ${icone("relogio")}
        <div><small>Próxima consulta</small>
          <strong>${dataPorExtenso(prox.data)} às ${prox.hora}</strong>
          <span>${escapar(prox.tipo)} · ${escapar(prox.subtipo)}${animalProx ? ` · ${escapar(animalProx.nome)}` : ""}</span>
        </div>
      </a>` : ""}

    <div class="atalhos">
      ${ATALHOS.map((a) => `
        <a class="atalho cor-${a.cor}" href="#${a.rota}">
          <span class="atalho-ico">${icone(a.icone)}</span>
          <strong>${a.titulo}</strong>
          <small>${a.descricao}</small>
        </a>`).join("")}
    </div>

    <section class="painel">
      <div class="painel-topo">
        <h2>Dúvidas frequentes</h2>
        <a href="#ajuda" class="link">Ver todas</a>
      </div>
      ${listaDuvidas(DUVIDAS.slice(0, 4))}
      ${formDuvida()}
    </section>`;
  ligarFormDuvida();
}

function listaDuvidas(lista) {
  return `<div class="duvidas">${lista.map((d) => `
    <details class="duvida"><summary>${escapar(d.p)}</summary><p>${escapar(d.r)}</p></details>`).join("")}</div>`;
}

function formDuvida() {
  return `
    <form class="form-duvida" id="form-duvida">
      <label for="texto-duvida">Não encontrou? Envie sua dúvida</label>
      <div class="linha-envio">
        <input id="texto-duvida" maxlength="200" placeholder="Escreva aqui…">
        <button class="btn btn-rosa btn-icone-texto">${icone("enviar")}<span>Enviar</span></button>
      </div>
    </form>`;
}

function ligarFormDuvida() {
  $("#form-duvida").addEventListener("submit", (e) => {
    e.preventDefault();
    const txt = $("#texto-duvida").value.trim();
    if (!txt) return $("#texto-duvida").focus();
    duvidasEnviadas.push({ id: novoId(), dono: usuario.id, texto: txt, data: hojeISO() });
    gravar("rga_duvidas", duvidasEnviadas);
    $("#texto-duvida").value = "";
    toast("Dúvida enviada! Responderemos pelo seu e-mail.");
    if (location.hash === "#ajuda") telaAjuda();
  });
}

/* ==========================================================
   RGA — LISTA, NOVO E DOCUMENTO
   ========================================================== */
function telaRgaLista() {
  const lista = meusAnimais();
  conteudo.innerHTML = `
    ${cabecalho("Meus RGAs", "Documentos dos seus animais",
      `<a class="btn btn-rosa btn-icone-texto" href="#novo-rga">${icone("mais")}<span>Novo RGA</span></a>`)}
    ${lista.length ? `
      <div class="grade-cartoes">
        ${lista.map((a) => `
          <a class="cartao-animal" href="#rga/${a.id}">
            <div class="foto-animal" ${a.foto ? `style="background-image:url(${a.foto})"` : ""}>${a.foto ? "" : EMOJI_ESPECIE[a.especie] || "🐾"}</div>
            <div>
              <strong>${escapar(a.nome)}</strong>
              <span class="num-rg">RG ${a.rg}</span>
              <small>${escapar(a.especie)} · ${escapar(a.raca)} · ${calcularIdade(a.nascimento)}</small>
            </div>
          </a>`).join("")}
      </div>` : vazio("Você ainda não tem nenhum RGA.", `<a class="btn btn-rosa" href="#novo-rga">Emitir o primeiro RGA</a>`)}`;
}

function vazio(texto, acao = "") {
  return `<div class="vazio"><img src="img/logo-rga.png" alt=""><p>${texto}</p>${acao}</div>`;
}

let fotoAtual = null;

function telaNovoRga() {
  fotoAtual = null;
  conteudo.innerHTML = `
    ${cabecalho("Novo RGA", "Preencha os dados do animal. Os dados do tutor vêm da sua conta.")}
    <form id="form-animal" class="formulario" novalidate>
      <section class="painel">
        <h2>Dados do animal</h2>
        <div class="form-animal-grade">
          <label class="campo foto-campo">
            <span>Foto</span>
            <div class="foto-preview" id="foto-preview">${icone("rga")}<small>Toque para tirar ou escolher</small></div>
            <input type="file" id="foto" accept="image/*" hidden>
          </label>
          <div class="grade">
            <label class="campo"><span>Nome *</span><input name="nome" maxlength="40"></label>
            <label class="campo"><span>Espécie *</span>
              <select name="especie"><option value="">Selecione</option>
                ${Object.keys(EMOJI_ESPECIE).map((e) => `<option>${e}</option>`).join("")}</select></label>
            <label class="campo"><span>Raça</span><input name="raca" maxlength="40" placeholder="SRD se não souber"></label>
            <label class="campo"><span>Sexo *</span>
              <select name="sexo"><option value="">Selecione</option><option>Macho</option><option>Fêmea</option></select></label>
            <label class="campo"><span>Nascimento *</span><input type="date" name="nascimento" max="${hojeISO()}"></label>
            <label class="campo"><span>Pelagem / cor</span><input name="pelagem" maxlength="40"></label>
            <label class="campo"><span>Porte</span>
              <select name="porte"><option>Pequeno</option><option selected>Médio</option><option>Grande</option></select></label>
            <label class="campo"><span>Peso (kg)</span><input type="number" name="peso" min="0" step="0.1"></label>
            <label class="campo"><span>Nº do microchip</span><input name="microchip" inputmode="numeric" maxlength="15" placeholder="15 dígitos"></label>
            <label class="campo checkbox"><input type="checkbox" name="castrado"><span>Castrado(a)</span></label>
          </div>
        </div>
        <label class="campo"><span>Endereço onde o animal vive</span><input name="endereco" maxlength="80" placeholder="Rua, número, bairro"></label>
        <label class="campo"><span>Observações (alergias, saúde, sinais particulares)</span><textarea name="observacoes" rows="3" maxlength="300"></textarea></label>
      </section>

      <section class="painel">
        <h2>Vacinas já tomadas</h2>
        <p class="texto-suave">Nome · data da aplicação · próxima dose</p>
        <div id="vacinas-form" class="vacinas-form"></div>
        <button type="button" class="btn btn-contorno btn-pequeno" id="add-vacina">+ Adicionar vacina</button>
      </section>

      <p class="erro" role="alert"></p>
      <div class="acoes">
        <a class="btn btn-contorno" href="#rga">Cancelar</a>
        <button class="btn btn-rosa">Emitir RG</button>
      </div>
    </form>`;

  const form = $("#form-animal");
  form.microchip.addEventListener("input", (e) => (e.target.value = soDigitos(e.target.value).slice(0, 15)));
  $("#add-vacina").addEventListener("click", () => linhaVacina());
  linhaVacina();

  // Foto: reduz para no máx. 400px para não lotar o armazenamento
  $("#foto").addEventListener("change", (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, 400 / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * escala);
        c.height = Math.round(img.height * escala);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        fotoAtual = c.toDataURL("image/jpeg", 0.8);
        const p = $("#foto-preview");
        p.style.backgroundImage = `url(${fotoAtual})`;
        p.classList.add("com-foto");
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = (n) => form.elements[n].value.trim();
    for (const [campo, nome] of [["nome", "o nome"], ["especie", "a espécie"], ["sexo", "o sexo"], ["nascimento", "a data de nascimento"]]) {
      if (!v(campo)) return erroEm(form, `Informe ${nome} do animal.`, campo);
    }
    if (v("microchip") && v("microchip").length !== 15) return erroEm(form, "O microchip deve ter 15 dígitos.", "microchip");

    const animal = {
      id: novoId(), dono: usuario.id, rg: gerarNumeroRG(), emissao: hojeISO(), foto: fotoAtual,
      nome: v("nome"), especie: v("especie"), raca: v("raca") || "SRD", sexo: v("sexo"),
      nascimento: v("nascimento"), pelagem: v("pelagem"), porte: v("porte"), peso: v("peso"),
      microchip: v("microchip"), castrado: form.castrado.checked, endereco: v("endereco"),
      observacoes: v("observacoes"), cpf: usuario.cpf, tutor: usuario.nome,
      vacinas: lerVacinas($("#vacinas-form")),
    };
    animais.push(animal);
    if (!gravar("rga_animais", animais)) { animais.pop(); return; }
    toast(`RG de ${animal.nome} emitido!`);
    location.hash = `#rga/${animal.id}`;
  });
}

function linhaVacina(destino = $("#vacinas-form")) {
  const l = document.createElement("div");
  l.className = "linha-vacina";
  l.innerHTML = `
    <input class="v-nome" placeholder="Ex.: Raiva, V10" maxlength="40">
    <input class="v-data" type="date" max="${hojeISO()}" title="Data da aplicação">
    <input class="v-proxima" type="date" title="Próxima dose">
    <button type="button" class="remover" aria-label="Remover">×</button>`;
  $(".remover", l).addEventListener("click", () => l.remove());
  destino.appendChild(l);
}
function lerVacinas(raiz) {
  return $$(".linha-vacina", raiz).map((l) => ({
    nome: $(".v-nome", l).value.trim(), data: $(".v-data", l).value, proxima: $(".v-proxima", l).value,
  })).filter((v) => v.nome);
}

function situacaoVacina(v) {
  if (!v.proxima) return { classe: "ok", texto: "Aplicada" };
  return v.proxima < hojeISO() ? { classe: "atrasada", texto: "Reforço atrasado" } : { classe: "ok", texto: "Em dia" };
}

/* Código de barras decorativo a partir do número do RG */
function codigoBarras(rg) {
  const d = soDigitos(rg);
  return `<div class="codigo-barras">${[...(d + [...d].reverse().join(""))]
    .map((n) => `<i style="width:${(n % 3) + 1}px"></i><i class="vao"></i>`).join("")}</div>`;
}

const dado = (rotulo, valor) => `<div class="dado"><label>${rotulo}</label><span>${escapar(valor || "—")}</span></div>`;

let abaRga = "vacinacao";

function telaRgaDetalhe(id) {
  const a = meusAnimais().find((x) => x.id === id);
  if (!a) { location.hash = "#rga"; return; }

  conteudo.innerHTML = `
    <a href="#rga" class="voltar nao-imprimir">${icone("voltar")} Meus RGAs</a>

    <article class="documento">
      <header class="doc-topo">
        <img src="img/logo-rga.png" alt="RGA">
        <div><strong>Registro Geral Animal</strong><small>Carteira de identidade animal</small></div>
      </header>
      <div class="doc-corpo">
        <div class="doc-foto" ${a.foto ? `style="background-image:url(${a.foto})"` : ""}>${a.foto ? "" : EMOJI_ESPECIE[a.especie] || "🐾"}</div>
        <div class="doc-dados">
          <div class="dado dado-largo"><label>Nº do registro</label><span class="num-doc">${a.rg}</span></div>
          ${dado("Nome", a.nome)}
          ${dado("Idade", `${calcularIdade(a.nascimento)} (${formatarData(a.nascimento)})`)}
          <div class="dado dado-largo"><label>Tutor</label><span>${escapar(a.tutor || usuario.nome)}</span></div>
          ${dado("Espécie", a.especie)}
          ${dado("Raça", a.raca)}
          ${dado("Sexo", a.sexo)}
          ${dado("Pelagem", a.pelagem)}
          ${dado("Castrado(a)", a.castrado ? "Sim" : "Não")}
          ${dado("Porte", a.porte + (a.peso ? ` · ${a.peso} kg` : ""))}
        </div>
      </div>
      <footer class="doc-rodape"><span>Emitido em ${formatarData(a.emissao)}</span>${codigoBarras(a.rg)}</footer>
    </article>

    <div class="abas nao-imprimir" role="tablist">
      <button role="tab" data-aba="vacinacao">Vacinação</button>
      <button role="tab" data-aba="localizacao">Localização</button>
      <button role="tab" data-aba="saude">Saúde</button>
    </div>
    <section class="painel aba-conteudo" id="aba-conteudo"></section>

    <div class="acoes nao-imprimir">
      <button class="btn btn-contorno btn-icone-texto" id="btn-excluir">${icone("lixo")}<span>Excluir</span></button>
      ${NATIVO ? "" : `<button class="btn btn-verde btn-icone-texto" id="btn-imprimir">${icone("imprimir")}<span>Imprimir</span></button>`}
    </div>`;

  const desenharAba = () => {
    $$(".abas button").forEach((b) => b.setAttribute("aria-selected", b.dataset.aba === abaRga));
    const alvo = $("#aba-conteudo");

    if (abaRga === "vacinacao") {
      alvo.innerHTML = `
        ${a.vacinas.length ? `<ul class="lista-vacinas">${a.vacinas.map((v, i) => {
          const s = situacaoVacina(v);
          return `<li>
            <div><strong>${escapar(v.nome)}</strong><small>Aplicada em ${formatarData(v.data)}${v.proxima ? ` · próxima: ${formatarData(v.proxima)}` : ""}</small></div>
            <span class="status ${s.classe}">${s.classe === "ok" ? icone("check") : ""}${s.texto}</span>
            <button class="remover nao-imprimir" data-remover="${i}" aria-label="Remover vacina">×</button>
          </li>`;
        }).join("")}</ul>` : `<p class="texto-suave">Nenhuma vacina registrada.</p>`}
        <form id="form-nova-vacina" class="nao-imprimir">
          <div id="nova-vacina" class="vacinas-form"></div>
          <button class="btn btn-contorno btn-pequeno">Registrar vacina</button>
        </form>`;
      linhaVacina($("#nova-vacina"));
      $(".linha-vacina .remover", alvo).remove();
      $("#form-nova-vacina").addEventListener("submit", (e) => {
        e.preventDefault();
        const nova = lerVacinas($("#nova-vacina"));
        if (!nova.length) return $(".v-nome", alvo).focus();
        a.vacinas.push(...nova);
        gravar("rga_animais", animais);
        toast("Vacina registrada.");
        desenharAba();
      });
      $$("[data-remover]", alvo).forEach((b) => b.addEventListener("click", () => {
        if (!confirm("Remover esta vacina?")) return;
        a.vacinas.splice(Number(b.dataset.remover), 1);
        gravar("rga_animais", animais);
        desenharAba();
      }));
    }

    if (abaRga === "localizacao") {
      alvo.innerHTML = `
        <div class="aviso-perda">${icone("local")}<p>Encontrou este animal? Entre em contato com o tutor pelos dados abaixo.</p></div>
        <div class="doc-dados">
          ${dado("Tutor responsável", a.tutor || usuario.nome)}
          ${dado("Telefone", usuario.telefone)}
          ${dado("Cidade / UF", usuario.cidade)}
          ${dado("E-mail", usuario.email)}
          <div class="dado dado-largo"><label>Endereço</label><span>${escapar(a.endereco || "Não informado")}</span></div>
          ${dado("Microchip", a.microchip || "Não possui")}
        </div>`;
    }

    if (abaRga === "saude") {
      const proximas = consultasFuturas().filter((c) => c.animalId === a.id);
      alvo.innerHTML = `
        <div class="doc-dados">
          ${dado("Peso", a.peso ? `${a.peso} kg` : "")}
          ${dado("Castrado(a)", a.castrado ? "Sim" : "Não")}
          <div class="dado dado-largo"><label>Observações</label><span>${escapar(a.observacoes || "Nenhuma")}</span></div>
        </div>
        <h3 class="subtitulo">Próximas consultas</h3>
        ${proximas.length ? listaConsultas(proximas, false)
          : `<p class="texto-suave">Nenhuma consulta marcada. <a class="link" href="#marcar">Marcar agora</a></p>`}`;
    }
  };

  $$(".abas button").forEach((b) => b.addEventListener("click", () => { abaRga = b.dataset.aba; desenharAba(); }));
  desenharAba();

  $("#btn-imprimir")?.addEventListener("click", () => window.print());
  $("#btn-excluir").addEventListener("click", () => {
    if (!confirm(`Excluir o RGA de ${a.nome}? Esta ação não pode ser desfeita.`)) return;
    animais = animais.filter((x) => x.id !== a.id);
    consultas = consultas.filter((c) => c.animalId !== a.id);
    gravar("rga_animais", animais);
    gravar("rga_consultas", consultas);
    toast("RGA excluído.");
    location.hash = "#rga";
  });
}

/* ==========================================================
   MARQUE SUA CONSULTA (lista + calendário + agendamento)
   ========================================================== */
let mesCalendario = new Date();

function calendario(mes, { marcados = [], selecionado = null, selecionavel = false } = {}) {
  const ano = mes.getFullYear(), m = mes.getMonth();
  const primeiro = new Date(ano, m, 1).getDay();
  const dias = new Date(ano, m + 1, 0).getDate();
  const hoje = hojeISO();
  const agora = new Date();
  const podeVoltar = !selecionavel || ano > agora.getFullYear() || (ano === agora.getFullYear() && m > agora.getMonth());

  let celulas = "";
  for (let i = 0; i < primeiro; i++) celulas += "<span></span>";
  for (let d = 1; d <= dias; d++) {
    const iso = `${ano}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const domingo = new Date(ano, m, d).getDay() === 0;
    const bloqueado = selecionavel && (iso < hoje || domingo);
    const classes = [iso === hoje && "hoje", marcados.includes(iso) && "marcado", iso === selecionado && "selecionado"]
      .filter(Boolean).join(" ");
    celulas += `<button type="button" class="${classes}" data-dia="${iso}" ${bloqueado || !selecionavel ? "disabled" : ""}>${d}</button>`;
  }
  return `
    <div class="calendario">
      <div class="cal-topo">
        <button type="button" class="btn-icone" data-mes="-1" aria-label="Mês anterior" ${podeVoltar ? "" : "disabled"}>${icone("voltar")}</button>
        <strong>${MESES[m]} ${ano}</strong>
        <button type="button" class="btn-icone" data-mes="1" aria-label="Próximo mês">${icone("avancar")}</button>
      </div>
      <div class="cal-semana">${["D", "S", "T", "Q", "Q", "S", "S"].map((s) => `<span>${s}</span>`).join("")}</div>
      <div class="cal-dias">${celulas}</div>
    </div>`;
}

function ligarNavegacaoCalendario(redesenhar) {
  $$("[data-mes]").forEach((b) => b.addEventListener("click", () => {
    mesCalendario = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + Number(b.dataset.mes), 1);
    redesenhar();
  }));
}

function listaConsultas(lista, comCancelar = true) {
  return `<ul class="lista-consultas">${lista.map((c) => {
    const a = animais.find((x) => x.id === c.animalId);
    const [, m, d] = c.data.split("-");
    return `<li>
      <div class="data-bloco"><strong>${d}</strong><small>${MESES[Number(m) - 1].slice(0, 3)}</small></div>
      <div><strong>${escapar(c.tipo)} · ${escapar(c.subtipo)}</strong>
        <small>${c.hora} · ${a ? escapar(a.nome) : "Animal removido"}</small></div>
      ${comCancelar ? `<button class="link" data-cancelar="${c.id}">Cancelar</button>` : ""}
    </li>`;
  }).join("")}</ul>`;
}

function telaConsultas() {
  const futuras = consultasFuturas();
  const desenhar = () => {
    conteudo.innerHTML = `
      ${cabecalho("Marque sua consulta", "Exames, consultas e cirurgias",
        `<a class="btn btn-rosa btn-icone-texto" href="#marcar">${icone("mais")}<span>Marcar</span></a>`)}
      <div class="duas-colunas">
        <section class="painel">
          <h2>Minhas consultas</h2>
          ${futuras.length ? listaConsultas(futuras)
            : `<p class="texto-suave">Nenhuma consulta marcada.</p><a class="btn btn-rosa" href="#marcar">Marcar consulta</a>`}
        </section>
        <section class="painel">
          <h2>Calendário</h2>
          ${calendario(mesCalendario, { marcados: futuras.map((c) => c.data) })}
          <p class="legenda"><i class="ponto"></i> dias com consulta marcada</p>
        </section>
      </div>`;
    ligarNavegacaoCalendario(desenhar);
    $$("[data-cancelar]").forEach((b) => b.addEventListener("click", () => {
      if (!confirm("Cancelar esta consulta?")) return;
      consultas = consultas.filter((c) => c.id !== b.dataset.cancelar);
      gravar("rga_consultas", consultas);
      toast("Consulta cancelada.");
      telaConsultas();
    }));
  };
  desenhar();
}

let agendamento = {};

function telaMarcar() {
  const lista = meusAnimais();
  if (!agendamento.inicio) { agendamento = { inicio: true }; mesCalendario = new Date(); }
  if (!lista.length) {
    conteudo.innerHTML = `${cabecalho("Marcar consulta")}
      ${vazio("Para marcar uma consulta, primeiro emita o RGA do seu animal.", `<a class="btn btn-rosa" href="#novo-rga">Emitir RGA</a>`)}`;
    return;
  }
  if (lista.length === 1) agendamento.animalId = lista[0].id;

  const ocupados = consultas.filter((c) => c.data === agendamento.data).map((c) => c.hora);
  const passo = (n, titulo, html, ativo = true) => ativo ? `
    <section class="painel passo" id="passo-${n}">
      <h2><span class="num-passo">${n}</span>${titulo}</h2>${html}
    </section>` : "";
  const ag = agendamento;

  conteudo.innerHTML = `
    <a href="#consultas" class="voltar">${icone("voltar")} Minhas consultas</a>
    ${cabecalho("Marcar consulta")}

    ${passo(1, "Qual animal?", `
      <div class="opcoes">${lista.map((a) => `
        <button type="button" class="opcao ${ag.animalId === a.id ? "ativa" : ""}" data-animal="${a.id}">
          <span>${EMOJI_ESPECIE[a.especie] || "🐾"}</span>${escapar(a.nome)}</button>`).join("")}
      </div>`)}

    ${passo(2, "Tipo de atendimento", `
      <div class="tipos">${Object.keys(TIPOS_ATENDIMENTO).map((t) => `
        <button type="button" class="tipo ${ag.tipo === t ? "ativa" : ""}" data-tipo="${t}">${t}</button>`).join("")}
      </div>
      ${ag.tipo ? `<div class="opcoes">${TIPOS_ATENDIMENTO[ag.tipo].map((s) => `
        <button type="button" class="opcao ${ag.subtipo === s ? "ativa" : ""}" data-subtipo="${s}">${s}</button>`).join("")}</div>` : ""}`,
      !!ag.animalId)}

    ${passo(3, "Escolha o dia", calendario(mesCalendario, { selecionado: ag.data, selecionavel: true }), !!ag.subtipo)}

    ${passo(4, "Escolha o horário", `
      <div class="horarios">${HORARIOS.map((h) => {
        const passou = ag.data === hojeISO() && h <= new Date().toTimeString().slice(0, 5);
        const indisponivel = ocupados.includes(h) || passou;
        return `<button type="button" class="opcao ${ag.hora === h ? "ativa" : ""}" data-hora="${h}" ${indisponivel ? "disabled" : ""}>${h}</button>`;
      }).join("")}</div>`, !!ag.data)}

    ${ag.hora ? `
      <section class="painel resumo">
        <p><strong>${escapar(ag.tipo)} · ${escapar(ag.subtipo)}</strong> para
           <strong>${escapar(lista.find((a) => a.id === ag.animalId).nome)}</strong><br>
           ${dataPorExtenso(ag.data)} às ${ag.hora}</p>
        <button class="btn btn-rosa btn-bloco" id="confirmar">Confirmar agendamento</button>
      </section>` : ""}`;

  const ir = (mudanca, proximo) => {
    Object.assign(agendamento, mudanca);
    telaMarcar();
    const alvo = $(proximo);
    if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $$("[data-animal]").forEach((b) => b.addEventListener("click", () => ir({ animalId: b.dataset.animal }, "#passo-2")));
  $$("[data-tipo]").forEach((b) => b.addEventListener("click", () =>
    ir({ tipo: b.dataset.tipo, subtipo: null, data: null, hora: null }, "#passo-2")));
  $$("[data-subtipo]").forEach((b) => b.addEventListener("click", () => ir({ subtipo: b.dataset.subtipo }, "#passo-3")));
  $$("[data-dia]").forEach((b) => b.addEventListener("click", () => ir({ data: b.dataset.dia, hora: null }, "#passo-4")));
  $$("[data-hora]").forEach((b) => b.addEventListener("click", () => ir({ hora: b.dataset.hora }, ".resumo")));
  ligarNavegacaoCalendario(() => { telaMarcar(); $("#passo-3")?.scrollIntoView({ block: "start" }); });

  $("#confirmar")?.addEventListener("click", () => {
    const c = { id: novoId(), dono: usuario.id, animalId: ag.animalId, tipo: ag.tipo, subtipo: ag.subtipo,
      data: ag.data, hora: ag.hora, criado: hojeISO() };
    consultas.push(c);
    if (!gravar("rga_consultas", consultas)) { consultas.pop(); return; }
    const animal = lista.find((a) => a.id === ag.animalId);
    agendamento = {};
    location.hash = "#consultas";
    setTimeout(() => abrirModal(`
      <div class="ticket">
        <img src="img/logo-rga.png" alt="RGA">
        <p class="texto-suave">Consulta confirmada</p>
        <div class="ticket-hora">${c.hora}</div>
        <strong>${dataPorExtenso(c.data)}</strong>
        <p>${escapar(c.tipo)} · ${escapar(c.subtipo)}<br>${escapar(animal.nome)} · RG ${animal.rg}</p>
        <small class="texto-suave">Chegue 15 minutos antes e leve a carteira de vacinação.</small>
        <button class="btn btn-rosa btn-bloco" onclick="document.getElementById('modal').close()">Ok</button>
      </div>`), 150);
  });
}

/* ==========================================================
   NOTÍCIAS, CUIDADOS E ADOÇÃO
   ========================================================== */
function telaNoticias() {
  conteudo.innerHTML = `
    ${cabecalho("Notícias", "Notícias de exemplo — conteúdo fictício do protótipo")}
    <div class="grade-noticias">${NOTICIAS.map((n, i) => `
      <button class="noticia cor-${n.cor}" data-noticia="${i}">
        <span class="tag">${n.tag}</span>
        <strong>${n.titulo}</strong>
        <p>${n.resumo}</p>
        <small>${formatarData(n.data)}</small>
      </button>`).join("")}</div>`;
  $$("[data-noticia]").forEach((b) => b.addEventListener("click", () => {
    const n = NOTICIAS[b.dataset.noticia];
    abrirModal(`<article class="noticia-completa">
      <span class="tag cor-${n.cor}">${n.tag}</span><h2>${n.titulo}</h2>
      <small class="texto-suave">${formatarData(n.data)}</small><p>${n.texto}</p></article>`);
  }));
}

function telaCuidados() {
  conteudo.innerHTML = `
    ${cabecalho("Cuidados", "Dicas para o dia a dia do seu animal")}
    <div class="grade-noticias">${CUIDADOS.map((c) => `
      <section class="cuidado cor-${c.cor}">
        <h2>${c.titulo}</h2>
        <ul>${c.itens.map((i) => `<li>${icone("check")}${i}</li>`).join("")}</ul>
      </section>`).join("")}</div>
    <p class="texto-suave nota">Estas dicas são gerais. Em caso de dúvida, consulte um veterinário.</p>`;
}

let filtroAdocao = "Todos";

function telaAdocao() {
  const filtros = ["Todos", "Cão", "Gato", "Outros"];
  const lista = ADOCAO.filter((a) => filtroAdocao === "Todos" ||
    (filtroAdocao === "Outros" ? !["Cão", "Gato"].includes(a.especie) : a.especie === filtroAdocao));
  const jaPediu = (id) => interesses.some((i) => i.dono === usuario.id && i.animal === id);

  conteudo.innerHTML = `
    ${cabecalho("Adoção", "Animais de exemplo esperando um lar")}
    <div class="opcoes filtros">${filtros.map((f) => `
      <button class="opcao ${filtroAdocao === f ? "ativa" : ""}" data-filtro="${f}">${f}</button>`).join("")}</div>
    <div class="grade-cartoes">${lista.map((a) => `
      <article class="cartao-adocao">
        <div class="foto-animal grande">${EMOJI_ESPECIE[a.especie]}</div>
        <div class="adocao-info">
          <strong>${a.nome}</strong>
          <small>${a.especie} · ${a.sexo} · ${a.idade} · ${a.porte}${a.castrado ? " · castrado(a)" : ""}</small>
          <p>${a.sobre}</p>
          ${jaPediu(a.id)
            ? `<span class="status ok">${icone("check")}Interesse enviado</span>`
            : `<button class="btn btn-rosa btn-pequeno" data-adotar="${a.id}">Quero adotar</button>`}
        </div>
      </article>`).join("")}</div>`;

  $$("[data-filtro]").forEach((b) => b.addEventListener("click", () => { filtroAdocao = b.dataset.filtro; telaAdocao(); }));
  $$("[data-adotar]").forEach((b) => b.addEventListener("click", () => {
    const a = ADOCAO.find((x) => x.id === b.dataset.adotar);
    abrirModal(`
      <form id="form-adotar" class="form-adotar">
        <div class="foto-animal grande">${EMOJI_ESPECIE[a.especie]}</div>
        <h2>Adotar ${a.nome}</h2>
        <p class="texto-suave">A equipe vai entrar em contato com você por estes dados:</p>
        <p><strong>${escapar(usuario.nome)}</strong><br>${escapar(usuario.telefone)} · ${escapar(usuario.email)}</p>
        <label class="campo"><span>Conte um pouco sobre você e sua casa (opcional)</span>
          <textarea name="mensagem" rows="3" maxlength="300"></textarea></label>
        <button class="btn btn-rosa btn-bloco">Enviar interesse</button>
      </form>`);
    $("#form-adotar").addEventListener("submit", (e) => {
      e.preventDefault();
      interesses.push({ id: novoId(), dono: usuario.id, animal: a.id, mensagem: e.target.mensagem.value.trim(), data: hojeISO() });
      gravar("rga_interesses", interesses);
      fecharModal();
      toast(`Interesse em adotar ${a.nome} enviado!`);
      telaAdocao();
    });
  }));
}

/* ==========================================================
   AJUDA (dúvidas frequentes)
   ========================================================== */
function telaAjuda() {
  const minhas = duvidasEnviadas.filter((d) => d.dono === usuario.id);
  conteudo.innerHTML = `
    ${cabecalho("Ajuda", "Dúvidas frequentes")}
    <section class="painel">
      ${listaDuvidas(DUVIDAS)}
      ${formDuvida()}
    </section>
    ${minhas.length ? `
      <section class="painel">
        <h2>Suas dúvidas enviadas</h2>
        <ul class="lista-simples">${minhas.map((d) => `
          <li><span>${escapar(d.texto)}</span><small>${formatarData(d.data)} · aguardando resposta</small></li>`).join("")}</ul>
      </section>` : ""}`;
  ligarFormDuvida();
}

/* ==========================================================
   ASSISTENTE "POSSO AJUDAR?"
   ========================================================== */
const chat = $("#chat");
const msgs = $("#chat-msgs");

function falar(texto, de = "bot") {
  const m = document.createElement("div");
  m.className = `msg msg-${de}`;
  m.textContent = texto;
  msgs.appendChild(m);
  msgs.scrollTop = msgs.scrollHeight;
}

function sugestoes() {
  const s = document.createElement("div");
  s.className = "sugestoes";
  DUVIDAS.slice(0, 5).forEach((d) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = d.p;
    b.addEventListener("click", () => perguntar(d.p));
    s.appendChild(b);
  });
  msgs.appendChild(s);
  msgs.scrollTop = msgs.scrollHeight;
}

function perguntar(texto) {
  falar(texto, "eu");
  const t = texto.toLowerCase();
  const achada = DUVIDAS.find((d) => d.p === texto) ||
    DUVIDAS.map((d) => ({ d, pontos: d.chaves.filter((c) => t.includes(c)).length }))
      .sort((a, b) => b.pontos - a.pontos).find((x) => x.pontos > 0)?.d;
  setTimeout(() => {
    if (achada) falar(achada.r);
    else {
      falar("Não encontrei uma resposta para isso. Você pode enviar sua dúvida na área de Ajuda que a equipe responde por e-mail.");
      sugestoes();
    }
  }, 350);
}

function iniciarChat() {
  msgs.innerHTML = "";
  falar(`Oi, ${usuario.nome.split(" ")[0]}! Sou o assistente do RGA. Como posso ajudar?`);
  sugestoes();
}

$("#btn-ajuda").addEventListener("click", () => {
  chat.hidden = !chat.hidden;
  if (!chat.hidden) $("#chat-input").focus();
});
$("#fechar-chat").addEventListener("click", () => (chat.hidden = true));
$("#chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const t = $("#chat-input").value.trim();
  if (!t) return;
  $("#chat-input").value = "";
  perguntar(t);
});

/* ==========================================================
   RECURSOS DE APLICATIVO E INICIALIZAÇÃO
   ========================================================== */

// Botão "voltar" do Android
if (NATIVO && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
  window.Capacitor.Plugins.App.addListener("backButton", () => {
    if ($("#modal").open) fecharModal();
    else if (!chat.hidden) chat.hidden = true;
    else if (document.body.classList.contains("menu-aberto")) fecharMenu();
    else if (usuario && location.hash && location.hash !== "#inicio") history.back();
    else window.Capacitor.Plugins.App.exitApp();
  });
}

// PWA: funciona sem internet e pode ser instalado na tela inicial
if ("serviceWorker" in navigator && location.protocol.startsWith("http") && !NATIVO) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

if (usuario) entrar(usuario);
else mostrarAuth("login");
setTimeout(() => $("#splash").classList.add("oculto"), 800);
