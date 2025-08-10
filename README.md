# Middleware Multi-Gateways de Pagamento

Uma plataforma moderna para gerenciamento de múltiplos gateways de pagamento, oferecendo funcionalidades completas para integrar com Asaas, Stripe, MercadoPago e outros gateways.

## Funcionalidades Principais

- 💳 **Gateways** - Gerenciamento e configuração de gateways de pagamento
- 📊 **Transações** - Acompanhamento e gestão de transações
- 🔔 **Webhooks** - Monitoramento de callbacks dos gateways
- 🛒 **Checkout** - Interface de pagamento simulado
- ⚙️ **Configurações** - Configurações do sistema e ambiente sandbox

## Tecnologias Utilizadas

- Vue.js 3
- Vue Router
- Pinia
- Chart.js
- Vue Chart.js

## Requisitos

- Node.js 16.x ou superior
- npm ou yarn

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/conectaai.git
cd conectaai
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

4. Acesse a aplicação em `http://localhost:5173`

## Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
# ou
yarn build
```

## Estrutura do Projeto

```
middleware-payments/
├── src/
│   ├── assets/        # Arquivos estáticos (imagens, fontes, etc)
│   ├── components/    # Componentes Vue reutilizáveis
│   ├── router/        # Configuração das rotas
│   ├── stores/        # Stores Pinia
│   ├── services/      # Serviços de API
│   ├── utils/         # Utilitários e constantes
│   └── views/         # Componentes de página
├── public/           # Arquivos públicos
└── package.json     # Dependências e scripts
```

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Suporte

Para suporte, envie um email para suporte@middleware-payments.com ou abra uma issue no GitHub.
