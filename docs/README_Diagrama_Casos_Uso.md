# Diagrama de Casos de Uso - Middleware Multigateways de Pagamento

## Visão Geral

Este diagrama representa o sistema **Middleware Multigateways de Pagamento**, uma solução intermediária que padroniza a comunicação entre sistemas clientes e múltiplos gateways de pagamento.

## Atores do Sistema

### 1. Sistema Cliente
- **Descrição**: Sistemas externos que enviam requisições para o middleware (e-commerce, ERPs, etc.)
- **Cor**: Azul (#0066CC)
- **Responsabilidades**: 
  - Enviar requisições de pagamento
  - Consultar status de transações
  - Receber respostas padronizadas

### 2. Administrador do Sistema
- **Descrição**: Responsável pela configuração e monitoramento do middleware
- **Cor**: Laranja (#FF6600)
- **Responsabilidades**:
  - Cadastrar novos gateways
  - Definir regras de prioridade e fallback
  - Visualizar logs e histórico
  - Configurar ambiente sandbox

### 3. Gateway de Pagamento
- **Descrição**: Sistemas externos de pagamento (Asaas, Stripe, MercadoPago)
- **Cor**: Verde (#00CC66)
- **Responsabilidades**:
  - Receber requisições formatadas
  - Retornar status de pagamento
  - Simular falhas para teste de fallback

## Casos de Uso

### Sistema Cliente

| Caso de Uso | Descrição | Relacionamento |
|--------------|-----------|----------------|
| Enviar requisição de pagamento | Sistema cliente envia dados de pagamento | Include |
| Consultar status da transação | Verificar status de uma transação específica | Include |
| Receber resposta padronizada | Receber resposta uniforme independente do gateway | Extend |
| Receber fallback automático | Receber resposta de gateway alternativo em caso de falha | Extend |

### Administrador do Sistema

| Caso de Uso | Descrição | Relacionamento |
|--------------|-----------|----------------|
| Cadastrar novo gateway | Adicionar novo gateway de pagamento ao sistema | Include |
| Definir regras de prioridade e fallback | Configurar ordem de prioridade dos gateways | Include |
| Visualizar logs e histórico de requisições | Monitorar atividade do sistema | Include |
| Configurar ambiente sandbox | Configurar ambiente de testes | Include |

### Gateway de Pagamento

| Caso de Uso | Descrição | Relacionamento |
|--------------|-----------|----------------|
| Receber requisição formatada | Receber dados de pagamento padronizados | Include |
| Retornar status de pagamento | Responder com status da transação | Include |
| Simular falha para fallback | Simular falha para testar mecanismo de fallback | Extend |

## Características Técnicas

### Ambiente Sandbox
- O sistema opera exclusivamente em ambiente de testes
- Não processa transações reais
- Permite testes seguros de integração

### Segurança
- **Nenhum dado sensível** é manipulado diretamente
- Cartões de crédito não são processados pelo middleware
- Foco em dados de transação e status

### Padronização
- Requisições são normalizadas na entrada
- Respostas são padronizadas na saída
- Interface uniforme independente do gateway

### Monitoramento
- Logs completos de todas as requisições
- Histórico de falhas e sucessos
- Métricas de performance por gateway

## Mecanismo de Fallback

1. **Detecção de Falha**: Sistema detecta falha no gateway principal
2. **Ativação Automática**: Gateway alternativo é ativado automaticamente
3. **Transparência**: Cliente não percebe a mudança de gateway
4. **Logs**: Toda falha e fallback são registrados

## Arquivos do Diagrama

- `diagrama_casos_uso_middleware.puml`: Código PlantUML do diagrama
- `diagrama_casos_uso_middleware.svg`: Versão visual em SVG
- `README_Diagrama_Casos_Uso.md`: Esta documentação

## Como Visualizar

1. **PlantUML**: Use um editor que suporte PlantUML (VS Code, IntelliJ, etc.)
2. **SVG**: Abra o arquivo SVG em qualquer navegador web
3. **Online**: Cole o código PlantUML em https://www.plantuml.com/plantuml/

## Benefícios do Sistema

- **Flexibilidade**: Suporte a múltiplos gateways
- **Confiabilidade**: Mecanismo de fallback automático
- **Simplicidade**: Interface padronizada para clientes
- **Monitoramento**: Logs completos e métricas
- **Segurança**: Operação em sandbox sem dados sensíveis 