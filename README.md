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

## Executando
Ambiente Node v16~18

```
npm install
npm run dev
```

Configurar um projeto firebase pelo console http://console.firebase.google.com/
Pegue as variaveis de projeto e substitua no .env
Todas as variaveis do .env são fornecidas na configuração do projeto do firebase


.env exemplo
```
FIREBASE_API_KEY= 
FIREBASE_AUTH_DOMAIN= 
FIREBASE_PROJECT_ID=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID= 
```

## 🤝 Contribuindo
Sugestões e PRs são bem-vindos!

---

## Imagens

![Texto Alternativo]([https://ibb.co/cS6YSK4H](https://i.ibb.co/Q3PD37yR/Captura-de-tela-de-2025-12-15-09-15-50.png))
![Texto Alternativo]([https://ibb.co/yc3nTrjM](https://i.ibb.co/kVnL6Lkx/screencapture-grilo-auto-service-web-app-dashboard-2025-12-15-09-06-57.png))
![Texto Alternativo]([https://ibb.co/v4fYf6VC](https://i.ibb.co/s9cHcdbp/Captura-de-tela-de-2025-12-15-09-18-02.png))
![Texto Alternativo](https://i.ibb.co/bjNZWR9D/Captura-de-tela-de-2025-12-15-09-05-48.png)


## 💬 Contato

**Luiz Fernando Mota Carvalho**  
Desenvolvedor Fullstack  
LinkedIn: [https://linkedin.com/](https://www.linkedin.com/in/luiz-fernando-mota-carvalho-82a34b8a/)
GitHub: [*seu usuário aqui*](https://github.com/fernandoMota93/)



