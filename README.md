# 💌 Convite de Casamento

Convite de casamento digital, interativo e responsivo, desenvolvido com HTML, CSS e JavaScript puros (vanilla). O convite simula um envelope físico que o convidado abre com um clique, revelando o convite com animações de escrita, chuva de pétalas e um formulário de confirmação de presença (RSVP).

## ✨ Funcionalidades

- **Envelope interativo**: animação de abertura do envelope ao clicar (ou pressionar Enter/Espaço), com efeito de brilhos (sparkles) renderizados em `<canvas>`.
- **Animação de escrita sequencial**: os elementos do convite (nomes, data, local, etc.) aparecem em sequência, como se estivessem sendo escritos.
- **Chuva de pétalas de rosa**: pétalas em SVG, com formatos e cores variados, geradas dinamicamente via JavaScript e animadas em CSS.
- **RSVP (confirmação de presença)**:
  - Formulário para nome completo; a confirmação é enviada ao WhatsApp dos noivos por link `wa.me` pré-preenchido.
  - Painéis distintos para confirmação ("Sim"), ausência ("Não") e agradecimento.
  - **Prazo de confirmação automático**: a partir de uma data limite definida no código, o formulário é substituído por um aviso de "Prazo encerrado".
- **Responsivo**: layout adaptado para dispositivos móveis (`viewport-fit=cover`).
- **Acessibilidade**: uso de `aria-hidden`, `aria-label`, foco automático em painéis e suporte a `prefers-reduced-motion` (desativa animações para quem tem essa preferência ativada).

## 🛠️ Tecnologias

- **HTML5**
- **CSS3** (variáveis CSS, animações `@keyframes`, gradientes)
- **JavaScript** (Vanilla JS, sem frameworks ou dependências externas)
- **Google Fonts**: [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond), [Great Vibes](https://fonts.google.com/specimen/Great+Vibes) e [Montserrat](https://fonts.google.com/specimen/Montserrat)

## 📁 Estrutura do projeto

```
.
├── index.html    # Estrutura do envelope e do convite
├── style.css     # Estilos, variáveis de cor, animações e responsividade
└── script.js     # Lógica de abertura do envelope, pétalas, escrita e RSVP
```

## 🚀 Como usar

Por ser um projeto estático (sem build ou dependências), basta:

1. Clonar o repositório:
   ```bash
   https://johnnjonathansantos-arch.github.io/LJ-invitation/
   ```
2. Abrir o arquivo `index.html` diretamente no navegador, ou servir a pasta com um servidor local, por exemplo:
  

## ⚙️ Personalização

Para reutilizar este convite em outro evento, os principais pontos a editar são:

- **`index.html`**: nomes dos noivos, data, horário, local e telefone de contato.
- **`script.js`**:
  - `WEDDING_DATE`: data do casamento.
  - `DEADLINE_DATE`: prazo final para confirmação de presença.
- **`style.css`**: paleta de cores no bloco `:root` (variáveis `--fuchsia`, `--blush`, etc.) para adaptar o tema visual.

## 📌 Observações

- O RSVP não usa backend: o convidado toca em um botão que abre o WhatsApp com a mensagem pronta (número em `WHATSAPP_NUMBER`, no `script.js`). Para uma lista automática de respostas, integre um serviço como Google Forms ou Formspree.
- O arquivo `Moldura.png` deve ficar na mesma pasta do `index.html`. Se ele faltar, uma moldura SVG simples é exibida no lugar.

## 📄 Licença

Projeto de uso pessoal para convite de casamento. Sinta-se à vontade para adaptar a estrutura e o código para seu próprio evento.
