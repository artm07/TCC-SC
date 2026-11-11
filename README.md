# RGA — Registro Geral Animal 🐾

Aplicativo web (projeto de TCC) que simula um "app do governo" para emitir o **RG dos animais**.
Feito com **HTML, CSS e JavaScript puro**, sem instalar nada.

Paleta: **Rosa** (`#e8559a`), **Dourado** (`#d4a933`) e **Verde-água** (`#2bbfae`).

## Como rodar
Abra o arquivo `index.html` no navegador (duplo clique). Pronto.

## Funcionalidades
- Cadastro do animal: foto, nome, espécie, raça, sexo, nascimento, pelagem, porte, peso, microchip, castração e observações
- Dados do tutor com validação de CPF e máscaras de CPF/telefone
- Geração automática do número do RG (`000.000.000-D`) com dígito verificador (módulo 11)
- Documento com **frente e verso** + código de barras decorativo
- **Carteira de vacinação** com situação (em dia / reforço atrasado)
- Consulta por nome, nº do RG, tutor ou CPF, com filtro por espécie
- Impressão do documento e exclusão de cadastro
- Painel inicial com estatísticas
- Layout responsivo (celular e computador)

## Estrutura
```
index.html      → páginas (Início, Cadastrar, Consultar) e modal do documento
css/style.css   → visual e cores (variáveis no :root)
img/logo-rga.png → logo do RGA
js/app.js       → lógica: cadastro, validações, RG, busca, vacinas
```

Os dados ficam salvos no `localStorage` do navegador. Para uma versão com banco de dados real,
o próximo passo seria criar um back-end (ex.: Node.js + Express + SQLite/PostgreSQL ou Firebase).
