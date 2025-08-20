# CURSOR_TASK.md

## 0) Contexto
Você é um agente dev atuando num front **Vue 3 + Vite + TypeScript + Vue Router + Pinia + Axios + Vuetify**.  
Use **exclusivamente** o arquivo OpenAPI (YAML) anexado como contrato da API:  
**`conectaai-public-v1.oas303.yaml`** (se o nome/path diferir, detecte automaticamente e informe no log o caminho real encontrado).

### Objetivo
Gerar uma UI funcional com CRUD para:
- **Clientes**
- **Cobranças**
- **Parcelamentos** (parte de cobranças, porém com rota própria)
- **Assinaturas**  
(Transferências ficam como TODO, **não implementar agora**.)

---

## 1) Inspeção inicial
1. Ler a raiz do projeto e identificar:
   - `package.json`, `vite.config.ts`, `tsconfig.json`, `.env*`
   - `src/`, `src/router`, `src/stores`, `src/services`, `src/components`, `src/views`, `src/layouts`
2. Detectar o arquivo OpenAPI:
   - Procurar por `*.yaml`/`*.yml` contendo `openapi: "3.0" ou "3.0.3"`.
   - Selecionar **o arquivo anexado** `conectaai-public-v1.oas303.yaml`.  
3. Emitir um **relatório no console**:
   - Stack detectada
   - Caminho do YAML
   - Dependências faltantes

---

## 2) Dependências e setup
- Se faltarem, instalar:
  - `axios`, `pinia`, `vue-router`, `vuetify`
  - `openapi-typescript` **ou** `@openapitools/openapi-generator-cli` (preferir `openapi-typescript` para gerar tipos; se o YAML exigir cliente, use `openapi-generator-cli` com `typescript-axios`).
  - `zod`, `@vueuse/core`
- Garantir Vuetify e Pinia configurados em `main.ts`.
- Criar `.env.example`:
  ```
  VITE_API_BASE_URL=https://api.local/v3
  VITE_DEV_TOKEN=
  ```

---

## 3) SDK/tipos a partir do YAML
### Opção A — Tipos + cliente manual
- Rodar `openapi-typescript conectaai-public-v1.oas303.yaml -o src/sdk/types.ts`
- Criar `src/services/http.ts` com `AxiosInstance`:
  - `baseURL` = `import.meta.env.VITE_API_BASE_URL`
  - Interceptors:
    - `Authorization: Bearer <token>` (token do Pinia `useAuth`)
    - `x-request-id` UUID por req
    - Retry leve para 429/5xx (exponencial simples, máx 2 tentativas)
- Criar `src/sdk/client.ts` com wrappers fortemente tipados usando `types.ts`.

### Opção B — Cliente gerado
- Usar `openapi-generator-cli generate -g typescript-axios -i conectaai-public-v1.oas303.yaml -o src/sdk`
- Ajustar `src/sdk` para usar `http.ts` (configurar `baseURL` e interceptors).

> **Critérios de aceite**: build sem erros de tipo; endpoints do YAML mapeados com tipos.

---

## 4) Design System básico (reutilizáveis)
Criar em `src/components/common`:
- `AppDataTable.vue`
- `AppForm.vue`
- `AppConfirmDialog.vue`
- `AppSnackbar.vue` + store `useSnackbar`
- `AppPageHeader.vue`

---

## 5) Layout e rotas
- `src/layouts/DefaultLayout.vue`
- `src/router/index.ts`: rotas com lazy-load:
  - `/clientes`
  - `/cobrancas`
  - `/parcelamentos`
  - `/assinaturas`
- Guardas de rota simples (auth → `/login`).

---

## 6) Stores (Pinia)
Criar em `src/stores`:
- `useAuth.ts`
- `useClientes.ts`, `useCobrancas.ts`, `useParcelamentos.ts`, `useAssinaturas.ts`, `useSnackbar.ts`.

Cada store deve ter:
- `state`: `list`, `item`, `loading`, `pagination`, `filters`, `total`
- `actions`: `fetchList`, `fetchById`, `create`, `update`, `remove`

---

## 7) Views (CRUD)
Criar em `src/views` para cada domínio: **Clientes, Cobranças, Parcelamentos, Assinaturas**.  
Cada um com List, Form, Details, respeitando schemas do YAML.

---

## 8) Mapeamento do contrato (YAML → código)
Para cada operação, mapear método, path, params, body e resposta.  
**Não inventar campos**: seguir fielmente o YAML.  
Se houver inconsistência, logar aviso.

---

## 9) Autenticação
- Se YAML tiver auth, implementar `/login`.  
- Se não, usar mock (`VITE_DEV_TOKEN`).

---

## 10) Observabilidade/UX
- Header `x-request-id` em todas requests.
- Erros → `AppSnackbar`.
- Debounce 300ms em filtros.

---

## 11) Testes
- Unit: `AppDataTable`, `AppForm`.
- E2E: fluxo feliz de Clientes.

---

## 12) Definition of Done
- [ ] SDK/tipos gerados
- [ ] Stores Pinia implementados
- [ ] Rotas e Layout prontos
- [ ] CRUDs completos para Clientes, Cobranças, Parcelamentos, Assinaturas
- [ ] Paginação server-side
- [ ] `.env.example` criado
- [ ] Testes mínimos
- [ ] Build sem erros

---

## 13) Ordem de execução
1. Detectar YAML
2. Instalar dependências
3. Gerar SDK/tipos
4. Criar `http.ts`
5. Criar componentes comuns
6. Criar rotas/layout
7. Implementar Clientes
8. Implementar Cobranças, Parcelamentos, Assinaturas
9. Testes
10. Build final + relatório
