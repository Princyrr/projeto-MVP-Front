# Sistema de busca de Empresas - Frontend

Interface web para gestão de prospecção de empresas, contatos e insights estratégicos.
(MVP)

---

## 🚀 Tecnologias

- React.js
- Recharts (gráficos)
- (requisições HTTP)
- Tailwind CSS/ Layout customizado

---

## 📂 Estrutura do Projeto

```
src/
├── assets/
├── components/
│   ├── AuditHistory.jsx
│   ├── Contacts.jsx
│   ├── CompanyDetails.jsx
│   ├── Dashboard.jsx
│   ├── EmpresasCadastradas.jsx
│   ├── Enriquecimento.jsx
│   ├── Header.jsx
│   ├── Insights.jsx
│   ├── Interacoes.jsx
│   ├── Layout.jsx
│   ├── Login.jsx
│   ├── PotencialModal.jsx
│   ├── SearchCompany.jsx
│   └── Sidebar.jsx
├── App.jsx
├── index.js
└── index.css
```

---

## ⚙️ Funcionalidades

### 🔍 Busca de Empresas

- Consulta via API
- Exibição detalhada da empresa

### 🏢 Cadastro de Empresas

- Botão "Adicionar empresa"
- Validação para evitar duplicidade (CNPJ único)

### 👥 Gestão de Contatos

- Adicionar, editar e excluir contatos
- Atualização automática de data/hora

### 📊 Dashboard

- Total de empresas cadastradas
- Total de empresas com contato e sem contato
- Status atual de prospecção
- Funil de prospecção
- Últimos contatos adicionados
- Última empresa consultada
- Gráfico de status

### 💡 Insights

- Cadastro com:
  - Descrição
  - Categoria
  - Autor
  - Data/hora

- Edição e exclusão

### 📈 Enriquecimento de Dados

- Site
- Instagram
- LinkedIn
- Facebook
- Nº de empregados
- Faturamento estimado
- Segmento comercial
- Potencial
- Observações

### 🎯 Interações

- Registro de:
  - Ligações
  - Resumo
  - Resultado

### 🔎 Filtros Avançados

- Filtros dinâmicos
- Botão "Limpar filtros"

---

## 🧩 Arquitetura de Componentes

O `CompanyDetails.jsx` foi desacoplado em módulos menores:

- Enriquecimento
- Contatos
- Insights
- Interações
- Status de prospecção

---

## 🔐 Autenticação (Frontend)

- Login integrado com backend
- Controle de permissões por tipo de usuário:
  - Admin
  - Consultor

---

## 🛠️ Como Rodar

```bash
npm install
npm start
```

---

## 🌐 Integração com API

Certifique-se de configurar a URL da API:

```js
export const API_URL = "http://localhost:3000";
```

---
