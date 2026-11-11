/* ==========================================================
   RGA — Conteúdos fixos do aplicativo
   (notícias, cuidados, adoção, dúvidas e tipos de consulta)
   Para mudar textos, basta editar este arquivo.
   ========================================================== */

/* Ícones de linha (SVG) usados no app */
const ICONES = {
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  inicio: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>',
  rga: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M14 10h4M14 13h3"/>',
  consulta: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M9 15l2 2 4-4"/>',
  noticias: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2Z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M7.5 9h6M7.5 12.5h6M7.5 16h4"/>',
  cuidados: '<path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.6 12 20 12 20Z"/><path d="M12 11v4M10 13h4"/>',
  adocao: '<path d="M19.5 12.6 12 20l-7.5-7.4A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 7.5 6Z"/>',
  ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.3 2.1-2.3 3.6M12 17h.01"/>',
  sair: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  enviar: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  gato: '<path d="M5 4.5 8.5 8h7L19 4.5V13a7 7 0 0 1-14 0Z"/><path d="M9.5 12.5h.01M14.5 12.5h.01M11 15.5h2l-1 1Z"/>',
  voltar: '<path d="m15 18-6-6 6-6"/>',
  avancar: '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  local: '<path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  imprimir: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  lixo: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  caixa: '<path d="M3 13h5l1.5 3h5l1.5-3h5"/><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6Z"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
  escudo: '<path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
};
const icone = (nome) => `<svg class="svg-ico" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome]}</svg>`;

/* Menu do administrador */
const MENU_ADMIN = [
  { rota: "painel",       titulo: "Painel",        icone: "inicio" },
  { rota: "emitir",       titulo: "Emitir RGA",    icone: "mais" },
  { rota: "rgas",         titulo: "RGAs emitidos", icone: "rga" },
  { rota: "tutores",      titulo: "Tutores",       icone: "pessoas" },
  { rota: "agenda",       titulo: "Agenda",        icone: "consulta" },
  { rota: "solicitacoes", titulo: "Solicitações",  icone: "caixa" },
];

/* Atalhos da tela inicial e do menu lateral (tutor) */
const ATALHOS = [
  { rota: "rga",       titulo: "RGA",                 descricao: "Documentos dos seus animais", icone: "rga",       cor: "verde" },
  { rota: "consultas", titulo: "Marque sua consulta", descricao: "Exames, consultas e cirurgias", icone: "consulta", cor: "rosa" },
  { rota: "noticias",  titulo: "Notícias",            descricao: "Campanhas e avisos",            icone: "noticias", cor: "dourado" },
  { rota: "cuidados",  titulo: "Cuidados",            descricao: "Dicas para o dia a dia",        icone: "cuidados", cor: "verde" },
  { rota: "adocao",    titulo: "Adoção",              descricao: "Encontre um novo amigo",        icone: "adocao",   cor: "rosa" },
];

/* Tipos de atendimento (mapa: Exame / Consulta / Cirurgia) */
const TIPOS_ATENDIMENTO = {
  Exame:    ["Sangue", "Raio-X", "Ultrassom", "Urina e fezes"],
  Consulta: ["Clínico geral", "Retorno", "Vacinação", "Dermatologia"],
  Cirurgia: ["Castração", "Parto", "Ortopédica", "Outra cirurgia"],
};
const HORARIOS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

/* Dúvidas frequentes (também usadas pelo assistente "Posso ajudar?") */
const DUVIDAS = [
  { p: "O que é o RGA?",
    r: "É o Registro Geral Animal: um documento de identificação do seu animal, com número único, foto, dados do tutor e carteira de vacinação.",
    chaves: ["rga", "o que é", "registro", "documento"] },
  { p: "Como emito o RG do meu animal?",
    r: "O RGA é emitido por um administrador, em um posto de atendimento. Leve seu animal e informe seu CPF. Depois de emitido, o documento aparece em “RGA” na sua conta (cadastrada com o mesmo CPF).",
    chaves: ["emitir", "emito", "cadastrar animal", "novo rga", "fazer rg", "tirar rg", "posto"] },
  { p: "Como marco uma consulta?",
    r: "Vá em “Marque sua consulta”, escolha o animal, o tipo (Exame, Consulta ou Cirurgia), o dia no calendário e o horário. Depois é só confirmar.",
    chaves: ["consulta", "marcar", "agendar", "exame", "cirurgia", "castração", "horário"] },
  { p: "Como cancelo uma consulta?",
    r: "Em “Marque sua consulta”, na lista “Minhas consultas”, toque em “Cancelar” ao lado do agendamento.",
    chaves: ["cancelar", "desmarcar"] },
  { p: "Esqueci minha senha. E agora?",
    r: "Na tela de login, toque em “Esqueci minha senha”, confirme seu CPF ou e-mail e o telefone cadastrado e crie uma senha nova.",
    chaves: ["senha", "esqueci", "login", "entrar"] },
  { p: "Como adoto um animal?",
    r: "Abra “Adoção”, escolha um animal e toque em “Quero adotar”. Seu interesse fica registrado para a equipe entrar em contato.",
    chaves: ["adotar", "adoção", "adocao"] },
  { p: "Onde meus dados ficam salvos?",
    r: "Neste protótipo, tudo fica salvo apenas neste aparelho/navegador. Se limpar os dados do navegador, as informações são apagadas.",
    chaves: ["dados", "salvo", "salvos", "privacidade", "apagar"] },
];

/* Notícias de exemplo (conteúdo fictício para o protótipo) */
const NOTICIAS = [
  { titulo: "Campanha de vacinação antirrábica", data: "2026-10-05", tag: "Campanha", cor: "verde",
    resumo: "Cães e gatos a partir de 3 meses devem tomar a vacina contra a raiva todos os anos.",
    texto: "A raiva é uma doença grave que pode ser transmitida para pessoas. A vacinação anual de cães e gatos é a principal forma de prevenção. Leve a carteira de vacinação do seu animal e registre a dose no RGA para acompanhar a data do próximo reforço." },
  { titulo: "Mutirão de castração", data: "2026-09-18", tag: "Saúde", cor: "rosa",
    resumo: "A castração ajuda a controlar a população de animais de rua e previne doenças.",
    texto: "Além de evitar ninhadas indesejadas, a castração reduz o risco de alguns tipos de câncer e de fugas. O procedimento pode ser agendado em “Marque sua consulta”, na opção Cirurgia → Castração." },
  { titulo: "Microchip: por que identificar seu pet", data: "2026-08-30", tag: "Identificação", cor: "dourado",
    resumo: "O microchip é do tamanho de um grão de arroz e facilita o reencontro em caso de perda.",
    texto: "O microchip tem um número de 15 dígitos que pode ser lido por um leitor. Registrando esse número no RGA, fica mais fácil ligar o animal ao tutor responsável caso ele se perca." },
  { titulo: "Cuidados com o calor", data: "2026-08-12", tag: "Dicas", cor: "verde",
    resumo: "Água fresca, sombra e passeios fora dos horários mais quentes.",
    texto: "Evite passeios entre 10h e 16h: o asfalto quente pode queimar as patas. Deixe sempre água fresca disponível e nunca deixe o animal dentro do carro fechado." },
  { titulo: "Fogos de artifício e animais", data: "2026-07-20", tag: "Bem-estar", cor: "rosa",
    resumo: "Barulhos fortes causam medo e podem provocar fugas e acidentes.",
    texto: "Em dias de festa, mantenha o animal em um local fechado e tranquilo, com portas e janelas trancadas. Uma identificação atualizada (RGA e plaquinha na coleira) ajuda muito se ele fugir." },
  { titulo: "Adoção responsável", data: "2026-07-02", tag: "Adoção", cor: "dourado",
    resumo: "Adotar é um compromisso para toda a vida do animal.",
    texto: "Antes de adotar, pense no espaço, no tempo disponível e nos custos com alimentação, vacinas e veterinário. Conheça os animais disponíveis na área de Adoção do app." },
];

/* Dicas de cuidados */
const CUIDADOS = [
  { titulo: "Alimentação", cor: "verde",
    itens: ["Ração adequada à idade e ao porte", "Água fresca sempre disponível", "Evite chocolate, uva, cebola e alho"] },
  { titulo: "Vacinas e vermífugo", cor: "rosa",
    itens: ["Siga o calendário do veterinário", "Antirrábica todo ano", "Vermífugo a cada 3 a 6 meses"] },
  { titulo: "Higiene", cor: "dourado",
    itens: ["Banho conforme a pelagem", "Escove o pelo com frequência", "Corte as unhas quando necessário"] },
  { titulo: "Passeios e exercícios", cor: "verde",
    itens: ["Passeios diários com guia", "Evite os horários mais quentes", "Brinquedos para gastar energia"] },
  { titulo: "Saúde bucal", cor: "rosa",
    itens: ["Escovação com pasta própria para pets", "Petiscos que ajudam a limpar os dentes", "Atenção ao mau hálito"] },
  { titulo: "Casa segura", cor: "dourado",
    itens: ["Telas em janelas (principalmente para gatos)", "Produtos de limpeza fora do alcance", "Coleira com plaquinha de identificação"] },
];

/* Animais para adoção (exemplos fictícios) */
const ADOCAO = [
  { id: "a1", nome: "Thor",   especie: "Cão",    sexo: "Macho", idade: "2 anos",   porte: "Médio",   castrado: true,  sobre: "Brincalhão, adora correr e se dá bem com crianças." },
  { id: "a2", nome: "Mel",    especie: "Gato",   sexo: "Fêmea", idade: "1 ano",    porte: "Pequeno", castrado: true,  sobre: "Carinhosa e tranquila, gosta de colo." },
  { id: "a3", nome: "Paçoca", especie: "Cão",    sexo: "Macho", idade: "4 meses", porte: "Pequeno", castrado: false, sobre: "Filhote curioso, cheio de energia." },
  { id: "a4", nome: "Luna",   especie: "Gato",   sexo: "Fêmea", idade: "4 anos",   porte: "Pequeno", castrado: true,  sobre: "Independente, perfeita para apartamento." },
  { id: "a5", nome: "Bento",  especie: "Cão",    sexo: "Macho", idade: "8 anos",   porte: "Grande",  castrado: true,  sobre: "Idoso calmo e muito companheiro." },
  { id: "a6", nome: "Nina",   especie: "Coelho", sexo: "Fêmea", idade: "1 ano",    porte: "Pequeno", castrado: false, sobre: "Dócil, come de tudo um pouco (verdinhas!)." },
];

const EMOJI_ESPECIE = {
  "Cão": "🐶", "Gato": "🐱", "Ave": "🐦", "Coelho": "🐰",
  "Roedor": "🐹", "Réptil": "🦎", "Outro": "🐾",
};
