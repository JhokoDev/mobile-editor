# 📱 Code Studio Mobile

Um editor de código leve, moderno e altamente responsivo, construído com **Vite**, **React 19** e **TypeScript**. O Code Studio Mobile foi projetado para oferecer uma experiência de desenvolvimento fluida tanto em dispositivos móveis quanto em desktops, aproveitando as APIs modernas da web para manipulação de arquivos locais.

---

## 🚀 Funcionalidades Principais

### 📂 Gerenciamento de Arquivos Moderno
- **File System Access API**: Integração direta com o sistema de arquivos do seu dispositivo. Abra arquivos individuais ou diretórios inteiros com permissões de leitura e escrita.
- **Explorador de Arquivos Intuitivo**: Navegação em árvore para pastas e arquivos, com suporte para múltiplos níveis de aninhamento.
- **Criação e Exclusão**: Adicione novos arquivos ou pastas e remova itens diretamente da interface.
- **Importação/Exportação ZIP**: Gere pacotes ZIP de seus projetos para backup ou compartilhamento rápido.

### ✍️ Experiência de Edição Refinada
- **Realce de Sintaxe Inteligente**: Suporte para diversas linguagens (JavaScript, TypeScript, Python, CSS, HTML, JSON, etc.) utilizando **PrismJS**.
- **Auto-fechamento de Parênteses**: Inserção automática de pares para `()`, `[]`, `{}`, `""` e `''`.
- **Indentação Automática**: Mantém o nível de indentação ao pressionar Enter.
- **Auto-Salvamento**: Lógica de debounce para salvar alterações automaticamente no disco (quando permissões são concedidas).
- **Indicador de Alterações**: Saiba instantaneamente quais arquivos possuem alterações não salvas.

### 🎨 Design e UX
- **Mobile-First & Responsivo**: Interface otimizada para telas pequenas com menus laterais deslizantes e áreas de toque generosas.
- **Animações Fluidas**: Transições suaves entre estados e menus utilizando **Framer Motion**.
- **Dark Mode Nativo**: Interface escura focada em reduzir a fadiga ocular durante longas sessões de codificação.
- **Barra de Status Dinâmica**: Exibe informações sobre o arquivo ativo, linguagem detectada e status de salvamento.

---

## 🛠️ Tecnologias Utilizadas

- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animações**: [Framer Motion (motion/react)](https://www.framer.com/motion/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Editor**: [react-simple-code-editor](https://github.com/satya164/react-simple-code-editor)
- **Syntax Highlighting**: [PrismJS](https://prismjs.com/)
- **Manipulação de Arquivos**: [JSZip](https://stuk.github.io/jszip/) (para exportação)

---

## 💻 Como Começar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/code-studio-mobile.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Comandos Disponíveis
- `npm run dev`: Inicia o servidor de desenvolvimento local.
- `npm run build`: Gera a versão de produção otimizada na pasta `dist`.
- `npm run lint`: Executa a verificação de linting para garantir a qualidade do código.

---

## 📖 Guia de Uso

1. **Abrir Projeto**: Clique no ícone de pasta no menu lateral ou na barra de ferramentas para selecionar um diretório local. O navegador solicitará permissão para acessar a pasta.
2. **Navegação**: Use a barra lateral esquerda para alternar entre arquivos. Em dispositivos móveis, deslize ou clique no ícone de hambúrguer para abrir o menu.
3. **Edição**: O editor central detecta automaticamente a linguagem baseada na extensão do arquivo. As alterações são salvas automaticamente após um breve período de inatividade (debounce).
4. **Exportação**: Use a opção de exportar para baixar todo o projeto atual como um arquivo `.zip`.

---

## 📁 Estrutura do Projeto

```text
src/
├── components/     # Componentes UI reutilizáveis
├── App.tsx         # Componente principal e lógica de estado
├── main.tsx        # Ponto de entrada da aplicação
├── index.css       # Estilos globais e Tailwind
└── types.ts        # Definições de tipos TypeScript
```

---

## ⚠️ Notas Importantes

- **Compatibilidade**: A funcionalidade de acesso direto ao sistema de arquivos (File System Access API) é suportada nativamente em navegadores baseados em Chromium (Chrome, Edge, Opera). Em outros navegadores, o editor funciona em modo de memória/fallback.
- **Segurança**: O acesso aos arquivos locais é sempre precedido por uma solicitação de permissão explícita do usuário, garantindo a segurança dos seus dados.

---

Desenvolvido com ❤️ para a comunidade de desenvolvedores móveis.
