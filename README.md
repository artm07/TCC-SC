# RGA — Registro Geral Animal 🐾

Aplicativo web (projeto de TCC) que simula um "app do governo" para emitir o **RG dos animais**.
Feito com **HTML, CSS e JavaScript puro**, sem instalar nada.

Paleta: **Rosa** (`#e8559a`), **Dourado** (`#d4a933`) e **Verde-água** (`#2bbfae`).

## Novidades desta versão

- **QR Code no RGA**: aparece no documento e em tamanho grande para imprimir na coleira. Quem escanear
  abre a página pública `encontrei.html`, com o nome do animal e botões para ligar ou mandar WhatsApp
  para o tutor, sem precisar de conta. Os dados vão dentro do próprio link, sem servidor.
- **Animais desaparecidos**: o tutor (ou o administrador) marca o animal como desaparecido, com data
  e local; ele aparece numa lista própria e com aviso no documento, até ser marcado como encontrado.
- **Lembretes de vacina**: aviso na tela inicial das vacinas atrasadas ou que vencem em até 30 dias.
  No app Android, notificação no celular 7 dias antes e no dia da dose.
- **Proteção de dados (LGPD)**: aceite dos Termos de uso ao criar conta, CPF sempre mascarado nas telas
  (529.\*\*\*.\*\*\*-25) e a tela **Meus dados**, para corrigir telefone e cidade ou excluir a conta.
- **Acessibilidade**: botões com contraste de pelo menos 4,5:1 (padrão WCAG AA) e contorno visível
  ao navegar pelo teclado.
- **Sobre o projeto**: na Ajuda, explicação de que o RGA é um protótipo e de que o cadastro oficial
  e gratuito de cães e gatos do governo federal é o **SinPatinhas** (Lei 15.046/2024), feito com a conta gov.br.

### Para o QR Code funcionar fora do seu computador
O QR Code aponta para `https://artm07.github.io/TCC-SC/encontrei.html`. Para esse endereço existir,
ative o **GitHub Pages** no repositório TCC-SC: **Settings → Pages → Deploy from a branch**, escolha a
branch com o código e a pasta **/ (root)**. No plano gratuito, o repositório precisa ser público.
Se publicar o site em outro endereço, troque `URL_PUBLICA` em `js/dados.js`.

## Denúncia de maus-tratos e estatísticas

- **Denunciar maus-tratos** (tutor): botão para ligar **190** em flagrante, canais oficiais (Disque
  Denúncia 181, Delegacia de Proteção Animal da Polícia Civil de SC, IBAMA Linha Verde 0800 061 8080)
  e a lei (Lei 9.605/1998, art. 32, e Lei 14.064/2020). O formulário registra a denúncia com número de
  **protocolo**, foto opcional e opção **anônima** (nome e telefone não são guardados).
  É um protótipo: a denúncia **não é enviada às autoridades**, e a tela avisa isso.
- **Denúncias** (administrador): lista com filtro por situação (Recebida, Em análise, Encaminhada às
  autoridades, Concluída), troca de situação com histórico.
- **Estatísticas** (todos): números gerais sem dados pessoais, com % de castrados e de vacinação em
  dia, RGAs por mês, por espécie e por cidade, atendimentos por tipo e denúncias por tipo e situação.
- **Dados de demonstração** (administrador, na tela Estatísticas): cria 24 RGAs, consultas e denúncias
  fictícias para os gráficos ficarem cheios na apresentação, e remove tudo com um clique, sem mexer
  nos dados reais.

Os canais de denúncia ficam em `CANAIS_DENUNCIA`, no arquivo `js/dados.js`. Confira se os números
continuam valendo na sua cidade antes da apresentação.

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
js/vendor/qrcode.js → gerador de QR Code (biblioteca MIT)
encontrei.html  → página pública aberta pelo QR Code
```

Os dados ficam salvos no `localStorage` do navegador. Para uma versão com banco de dados real,
o próximo passo seria criar um back-end (ex.: Node.js + Express + SQLite/PostgreSQL ou Firebase).
