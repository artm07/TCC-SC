# RGA — Registro Geral Animal 🐾

Aplicativo web (projeto de TCC) que simula um "app do governo" para emitir o **RG dos animais**.
Feito com **HTML, CSS e JavaScript puro**, sem instalar nada.

Paleta: **Rosa** (`#e8559a`), **Dourado** (`#d4a933`) e **Verde-água** (`#2bbfae`).

## Dois tipos de conta

| Conta | Quem é | O que faz |
|---|---|---|
| **Administrador** | Funcionário do posto de atendimento | **Emite, edita e exclui RGAs**, registra vacinas, vê todos os tutores, a agenda de consultas e as solicitações (adoção e dúvidas), cria outros administradores |
| **Tutor** | Dono do animal | Cria a própria conta, **vê os RGAs dos seus animais**, marca consultas, pede adoção, lê notícias e envia dúvidas |

**Administrador de teste:** login `admin@rga.sc` e senha `admin123`.
Troque a senha depois de entrar, em **Tutores → Administradores → Alterar minha senha**.

Como funciona a emissão: o administrador digita o **CPF do tutor**. Se o tutor já tem conta, os dados
aparecem sozinhos; se ainda não tem, o administrador informa nome e telefone e, quando o tutor criar
a conta com esse mesmo CPF, o RGA aparece para ele automaticamente.

## Telas do tutor (seguindo o mapa mental)
- **Login**: entrar com CPF ou e-mail e senha, criar conta e "Esqueci minha senha"
- **Início**: menu lateral (≡), atalhos (RGA, Marque sua consulta, Notícias, Cuidados, Adoção),
  aviso da próxima consulta e **Dúvidas frequentes** com envio de dúvida
- **RGA**: lista dos seus animais e documento com foto e dados,
  com as abas **Vacinação**, **Localização** e **Saúde**
- **Marque sua consulta**: Exame (Sangue, Raio-X…), Consulta ou Cirurgia (Castração, Parto…),
  escolha do dia no **calendário**, do horário e confirmação; lista "Minhas consultas" com cancelamento
- **Notícias**, **Cuidados** e **Adoção** (com "Quero adotar")
- **Posso ajudar?**: assistente com respostas rápidas
- **Sair**

Conteúdos fixos (notícias, dicas, animais para adoção, dúvidas, tipos de consulta) ficam em
`js/dados.js` — é só editar esse arquivo para mudar os textos.

> Protótipo: contas e dados ficam salvos **somente neste aparelho/navegador** (localStorage).
> A senha é guardada embaralhada, mas isso não é segurança de verdade — num sistema real
> o login ficaria num servidor.

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
js/dados.js     → textos fixos (notícias, cuidados, adoção, dúvidas)
js/app.js       → lógica de todas as telas
```

Os dados ficam salvos no `localStorage` do navegador. Para uma versão com banco de dados real,
o próximo passo seria criar um back-end (ex.: Node.js + Express + SQLite/PostgreSQL ou Firebase).
