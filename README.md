# ConectaAI — Dashboard

Interface web do [ConectaAI Gateway](https://github.com/Phelipe-Pereira/conectaAi_backend): um dashboard para gerenciar pagamentos, assinaturas, clientes e webhooks de múltiplos gateways de pagamento a partir de um único lugar.

---

## O que resolve

Empresas que operam com mais de um gateway de pagamento precisam acessar painéis diferentes, reconciliar dados manualmente e monitorar webhooks em sistemas separados. Este dashboard centraliza tudo — Asaas, Stripe e Mercado Pago — em uma única interface.

---

## Decisões técnicas

### Tipos gerados a partir do contrato OpenAPI

O arquivo `conectaai-public-v1-api.yaml` define o contrato da API. Os tipos TypeScript em `src/sdk/types.ts` são gerados automaticamente via `openapi-typescript` a partir desse contrato — não são escritos à mão. Isso garante que o frontend nunca fica dessincronizado do backend: se o contrato mudar, os tipos atualizam e os erros aparecem em tempo de compilação, não em produção.

### SDK tipado como camada de acesso à API

Em vez de chamar `axios` diretamente nas views ou stores, toda comunicação passa pelo `src/sdk/client.ts` — um cliente fortemente tipado que expõe métodos como `apiClient.charges.create(data)` com inferência completa de entrada e saída. Isso centraliza o contrato de chamada e facilita trocar a implementação HTTP sem tocar em nenhuma store.

### Retry com backoff exponencial

O interceptor em `src/services/http.ts` implementa retry automático para erros `429` (rate limit) e `5xx` (falhas de servidor) com delay exponencial: 1s na primeira tentativa, 2s na segunda. Isso evita que falhas transitórias do backend cheguem como erro para o usuário.

### Refresh token automático

Quando uma requisição retorna `401`, o interceptor tenta renovar o token automaticamente usando o refresh token armazenado. Somente se a renovação falhar o usuário é redirecionado para login. O fluxo é transparente — o usuário não percebe.

---

## Stack

- **Vue 3** com Composition API
- **TypeScript** em todo o projeto
- **Pinia** — stores por domínio (`useCharges`, `useCustomers`, `useSubscriptions`, `useWebhooks`, `useAuth`)
- **Vuetify 3** — componentes de UI
- **Chart.js** via `vue-chartjs` — gráficos do dashboard
- **Axios** com interceptors para auth, retry e request ID
- **Vitest** + `@vue/test-utils` — testes unitários
- **openapi-typescript** — geração de tipos a partir do contrato OpenAPI

---

## Telas implementadas

| Rota                       | Descrição                                                    |
| -------------------------- | ------------------------------------------------------------ |
| `/dashboard`               | Visão geral: cobranças, receita, clientes e assinaturas      |
| `/dashboard/clientes`      | Listagem, criação e edição de clientes                       |
| `/dashboard/cobrancas`     | Gestão de cobranças com filtros por status e método          |
| `/dashboard/assinaturas`   | Assinaturas recorrentes — pausar, retomar, cancelar          |
| `/dashboard/webhooks`      | Endpoints de webhook cadastrados por gateway                 |
| `/dashboard/notifications` | Notificações enviadas por canal (email, SMS, WhatsApp, push) |
| `/dashboard/gateways`      | Configuração dos gateways de pagamento                       |
| `/checkout`                | Interface de pagamento simulado                              |

---

## Rodando localmente

```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento (proxy para http://localhost:8080)
npm run dev

# Build de produção
npm run build
```

O Vite está configurado com proxy: chamadas para `/api` são redirecionadas para `http://localhost:8080` em desenvolvimento, sem necessidade de configurar CORS.

```bash
# Rodar testes
npm run test

# Testes em modo watch
npm run test -- --watch
```

---

## Estrutura

```
src/
├── sdk/
│   ├── types.ts       # Tipos gerados via openapi-typescript
│   └── client.ts      # Cliente API tipado (apiClient.charges.list, etc.)
├── services/
│   └── http.ts        # Axios com interceptors de auth, retry e request ID
├── stores/            # Pinia — uma store por domínio de negócio
├── views/             # Páginas da aplicação
├── components/
│   └── common/        # Componentes reutilizáveis (AppForm, AppDataTable, etc.)
├── router/            # Rotas com guard de autenticação
├── utils/             # Formatters e validators com testes
└── constants/         # Configuração centralizada (API, storage keys, etc.)
```

---

## Variáveis de ambiente

Crie um `.env.local` na raiz:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Em produção, configure `VITE_API_BASE_URL` apontando para a URL do backend deployado.

---

## Backend

Este dashboard consome a API do [ConectaAI Gateway](https://github.com/Phelipe-Pereira/conectaAi_backend) — middleware Spring Boot que unifica Asaas, Stripe e Mercado Pago. O contrato completo da API está em `conectaai-public-v1-api.yaml`.
