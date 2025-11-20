# 🚗 Grilo Auto Service — Plataforma Inteligente de Gestão de Ordens de Serviço

O **Grilo Auto Service** nasceu de uma necessidade real: transformar a rotina de uma oficina mecânica em um fluxo moderno, ágil e confiável.  
Desenvolver software não é apenas escrever código — é **resolver dores reais**.

E as dores aqui eram claras:

- Falta de organização nas ordens de serviço  
- Controle manual de clientes e veículos  
- Dificuldade de acompanhar o andamento das OS  
- Falta de histórico centralizado  
- Nenhuma automação de comunicação  
- Processo lento para gerar e entregar uma OS ao cliente  

Esse projeto foi criado para **resolver tudo isso de forma simples e eficiente.**

---

## ✨ Principais Funcionalidades

- ✔️ **Autenticação segura com Firebase Auth**  
- ✔️ **Envio de mensagens via WhatsApp** para comunicação rápida com clientes  
- ✔️ **Impressão de OS em PDF**, pronta para entregar ou arquivar  
- ✔️ Cadastro e gerenciamento de clientes, veículos e ordens de serviço  
- ✔️ Histórico completo e automatizado  
- ✔️ Acesso mobile e desktop  
- ✔️ Redirecionamento inteligente pós-login  
- ✔️ Salvamento em tempo real com Firestore  
- ✔️ Painel intuitivo e responsivo desenvolvido com Nuxt.js  

---

## 🔥 Por que este projeto importa?

Porque **tecnologia só faz sentido quando resolve um problema do mundo real**.

A plataforma:

- economiza tempo,  
- reduz erros,  
- melhora o atendimento,  
- facilita a comunicação com o cliente  
- e organiza o negócio com clareza e profissionalismo.

---

## 🛠️ Stack Técnica

### **Frontend**
- **Nuxt.js (Vue 2)**
- Componentes organizados e reativos
- Middleware de proteção de rotas
- UI otimizada para o fluxo de OS

### **Backend-as-a-Service**
- **Firebase Authentication**
- **Cloud Firestore** (estrutura de coleções organizada e segura)
- **Firebase Hosting** (deploy rápido e HTTPS automático)

### **Funcionalidades Extras**
- **Geração de PDF** utilizando bibliotecas client-side  
- **Integração com WhatsApp** (via query string / API Client-Side)  
- **Persistência de sessão** e redirecionamento contínuo pós-login  

---

## 🗂️ Estrutura Geral


```
/src
├── components
├── pages
├── services
├── store
├── plugins
└── utils
```


---

## 📄 Impressão em PDF

Cada OS pode ser gerada como **PDF com layout profissional**, garantindo padronização e facilidade para impressão ou envio digital.

---

## 💬 Envio direto via WhatsApp

Com apenas um clique, o sistema:

1. Monta automaticamente a mensagem com as informações da OS  
2. Redireciona o usuário para o WhatsApp Web / App  
3. Permite envio rápido, mantendo o cliente sempre atualizado  

---

## 🚀 Fluxo de Autenticação + Redirecionamento

1. Login via Firebase  
2. Sessão validada  
3. Middleware captura a último rota  
4. Redirecionamento automático pós-login  
5. Página carrega a OS correspondente sem fricção  

---

## 🤝 Contribuindo
Sugestões e PRs são bem-vindos!

---

## 💬 Contato

**Luiz Fernando Mota Carvalho**  
Desenvolvedor Fullstack  
LinkedIn: https://linkedin.com/  
GitHub: *seu usuário aqui*

