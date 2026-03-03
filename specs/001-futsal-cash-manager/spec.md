# Feature Specification: Sistema de Gerenciamento de Presença e Caixa para Futsal

**Feature Branch**: `001-futsal-cash-manager`  
**Created**: 2026-03-03  
**Status**: Draft  
**Input**: User description: "O produto que estou criando é para o gerenciamento de presença e caixa de um time de futsal. A home deve ser um dashboard com o valor em real brasileiro do caixa e uma listagem dos jogos do mês corrente. Jogo, é um jogo informal entre pessoas de um grupo de whatsapp, semanalmente as pessoas se reunem e jogam (nem sempre são as mesmas pessoas). O valor fixo do pagamento é 10,00, a quadra custa 90,00 por jogo. O caixa é a soma dos valores pagos subtraindo o valor da quadra. Há dois métodos de pagamento: pix para a gerente do time e pagamento na quadra. A cada jogo, a gerente pode marcar presença e forma de pagamento, bem como ajustar entradas e saídas do caixa sempre justificando. A gerente pode criar um jogo, lançar as presenças (pode ser uma replica do grupo de whats, ou um campo para colar uma lista e separar automaticamente os nomes) e informar o meio de pagamento. Ao 'finalizar jogo' o valor deve ser somado ou subtraido do caixa. O caixa deve manter um historico de entradas e saidas. Deve ter uma página com o histórico de partidas."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Visualizar Dashboard com Caixa e Jogos (Priority: P1)

Como gerente do time, quero visualizar um dashboard na home com o saldo atual do caixa em reais e a lista de jogos do mês corrente, para ter uma visão rápida da situação financeira e dos próximos jogos.

**Why this priority**: Esta é a funcionalidade central e o ponto de entrada principal da aplicação. Fornece valor imediato ao mostrar as informações mais importantes de forma clara. É a base para todas as outras funcionalidades.

**Independent Test**: Pode ser testado acessando a home e verificando se o saldo do caixa (calculado como soma de pagamentos menos custos de quadra) e a lista de jogos do mês atual são exibidos corretamente. Entrega valor de visualização mesmo sem outras funcionalidades.

**Acceptance Scenarios**:

1. **Given** a gerente acessa a home, **When** a página carrega, **Then** o valor do caixa em reais brasileiros (R$) é exibido de forma destacada
2. **Given** existem jogos no mês corrente, **When** a gerente visualiza o dashboard, **Then** a lista de jogos do mês é exibida com data e status
3. **Given** não há jogos no mês corrente, **When** a gerente visualiza o dashboard, **Then** uma mensagem indicativa é exibida
4. **Given** o caixa está negativo, **When** a gerente visualiza o dashboard, **Then** o valor é exibido em vermelho ou com indicação visual de alerta

---

### User Story 2 - Criar e Gerenciar Jogo com Presenças (Priority: P2)

Como gerente do time, quero criar um jogo informando a data, lançar as presenças dos jogadores (colando uma lista de nomes do WhatsApp ou digitando), informar o meio de pagamento de cada um (PIX ou na quadra) e finalizar o jogo para que o valor seja automaticamente somado ou subtraído do caixa.

**Why this priority**: Esta é a operação principal do sistema. Permite registrar os jogos e seus participantes, que é o core do gerenciamento. Sem isso, o caixa não pode ser atualizado corretamente.

**Independent Test**: Pode ser testado criando um jogo, adicionando jogadores (via campo de texto ou lista colada), marcando formas de pagamento (PIX ou na quadra - ambos contam para o caixa), finalizando o jogo e verificando se o caixa foi atualizado corretamente (soma de todos os pagamentos menos R$ 90 da quadra).

**Acceptance Scenarios**:

1. **Given** a gerente está na tela de criar jogo, **When** ela informa a data e clica em criar, **Then** um novo jogo é criado
2. **Given** um jogo foi criado, **When** a gerente cola uma lista de nomes do WhatsApp no campo de presenças, **Then** os nomes são automaticamente separados e adicionados como jogadores
3. **Given** jogadores foram adicionados, **When** a gerente marca o meio de pagamento de cada um (PIX ou na quadra), **Then** o sistema registra a forma de pagamento
4. **Given** todas as presenças e pagamentos foram registrados, **When** a gerente clica em "Finalizar Jogo", **Then** o sistema calcula os valores (soma de todos os pagamentos - R$ 90 da quadra) e atualiza o caixa
5. **Given** um jogo possui 10 jogadores com pagamento padrão de R$ 10 cada, **When** o jogo é finalizado, **Then** o caixa aumenta em R$ 10 (10 × R$ 10 - R$ 90)
6. **Given** um jogo possui 9 jogadores com pagamento padrão de R$ 10 cada (independente do método de pagamento), **When** o jogo é finalizado, **Then** o caixa diminui em R$ 0 (9 × R$ 10 - R$ 90 = 0)

---

### User Story 3 - Ajustar Entradas e Saídas do Caixa (Priority: P3)

Como gerente do time, quero poder ajustar manualmente o caixa adicionando entradas (ex: doações) ou saídas (ex: compra de bolas) informando o valor e uma justificativa, para manter o caixa sempre atualizado com todas as movimentações.

**Why this priority**: Importante para manter o caixa preciso, mas não é crítico para o funcionamento básico. Jogos podem ser gerenciados sem ajustes manuais. É uma funcionalidade de suporte.

**Independent Test**: Pode ser testado acessando a funcionalidade de ajuste manual, adicionando uma entrada (ex: R$ 50 de doação) com justificativa, e verificando se o caixa foi atualizado e a movimentação foi registrada no histórico.

**Acceptance Scenarios**:

1. **Given** a gerente acessa a tela de ajuste de caixa, **When** ela informa uma entrada de R$ 50 com justificativa "Doação de João", **Then** o caixa aumenta em R$ 50 e a movimentação é registrada
2. **Given** a gerente acessa a tela de ajuste de caixa, **When** ela informa uma saída de R$ 80 com justificativa "Compra de bolas", **Then** o caixa diminui em R$ 80 e a movimentação é registrada
3. **Given** a gerente tenta fazer um ajuste, **When** ela não informa a justificativa, **Then** o sistema exige que uma justificativa seja fornecida antes de confirmar
4. **Given** um ajuste foi feito, **When** a gerente visualiza o histórico, **Then** o ajuste aparece com data, valor, tipo (entrada/saída) e justificativa

---

### User Story 4 - Visualizar Histórico de Movimentações e Partidas (Priority: P4)

Como gerente do time, quero visualizar o histórico completo de todas as movimentações do caixa (entradas, saídas, jogos) e uma página separada com o histórico de partidas, para ter transparência e rastreabilidade de tudo que aconteceu.

**Why this priority**: Funcionalidade importante para auditoria e transparência, mas não é essencial para o dia a dia. O sistema pode funcionar sem histórico detalhado, embora seja valioso para análise posterior.

**Independent Test**: Pode ser testado visualizando o histórico de movimentações e verificando se todas as entradas, saídas e jogos finalizados aparecem com data, valor e descrição. E acessando a página de histórico de partidas para ver todos os jogos já realizados.

**Acceptance Scenarios**:

1. **Given** existem movimentações no caixa, **When** a gerente acessa o histórico de movimentações, **Then** todas as entradas, saídas e jogos são listados com data, valor e descrição
2. **Given** a gerente está no histórico, **When** ela visualiza uma movimentação de jogo, **Then** vê o detalhamento com lista de jogadores e formas de pagamento
3. **Given** existem jogos finalizados, **When** a gerente acessa a página de histórico de partidas, **Then** todos os jogos são listados com data, número de jogadores e status
4. **Given** o histórico de movimentações está aberto, **When** a gerente filtra por período, **Then** apenas movimentações do período selecionado são exibidas

### Edge Cases

- O que acontece quando um jogo tem menos de 9 jogadores (não cobre o custo da quadra de R$ 90)?  
  → Sistema deve permitir finalizar o jogo mesmo com caixa negativo, mas exibir alerta de prejuízo
  
- Como o sistema lida com jogadores que aparecem no meio do jogo (atletas reservas)?  
  → Gerente pode adicionar jogadores mesmo após início do jogo, antes de finalizar
  
- O que acontece se a gerente colar uma lista do WhatsApp com formatação estranha (emojis, números, etc.)?  
  → Sistema deve limpar automaticamente caracteres especiais e considerar apenas texto alfanumérico
  
- Como funciona se a quadra mudar de preço?  
  → O valor da quadra deve ser editável por jogo (padrão R$ 90, mas pode ser alterado)
  
- O que acontece se a gerente precisar cancelar um jogo já finalizado?  
  → Sistema deve permitir estornar um jogo, revertendo as movimentações do caixa
  
- Como o sistema lida com nomes duplicados de jogadores?  
  → Sistema deve permitir nomes duplicados (podem ser pessoas diferentes com mesmo nome)
  
- O que acontece se não houver jogos no mês corrente?  
  → Dashboard exibe mensagem "Nenhum jogo neste mês" ao invés de lista vazia
  
- Como funciona se o caixa começar negativo (débito inicial)?  
  → Sistema deve suportar valores negativos e permitir ajuste manual inicial do caixa

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Sistema DEVE exibir o saldo do caixa em reais brasileiros (R$) no dashboard
- **FR-002**: Sistema DEVE calcular o caixa como: (soma de TODOS os pagamentos dos jogadores) - R$ 90,00 da quadra
- **FR-003**: Sistema DEVE exibir lista de jogos do mês corrente no dashboard
- **FR-004**: Gerente DEVE poder criar um novo jogo informando a data
- **FR-005**: Sistema DEVE permitir adicionar jogadores manualmente (digitação)
- **FR-006**: Sistema DEVE permitir colar uma lista de nomes e separá-los automaticamente em jogadores
- **FR-007**: Sistema DEVE remover caracteres especiais, emojis e números ao processar lista colada
- **FR-008**: Gerente DEVE poder marcar a forma de pagamento de cada jogador (PIX ou na quadra) e editar o valor pago (padrão R$ 10,00)
- **FR-009**: Sistema DEVE permitir finalizar um jogo, calculando e atualizando o caixa automaticamente
- **FR-010**: Sistema DEVE considerar AMBAS formas de pagamento (PIX e na quadra) como entrada no caixa
- **FR-011**: Sistema DEVE subtrair R$ 90,00 do caixa ao finalizar cada jogo (custo da quadra)
- **FR-012**: Gerente DEVE poder adicionar entrada manual no caixa com valor e justificativa obrigatória
- **FR-013**: Gerente DEVE poder adicionar saída manual no caixa com valor e justificativa obrigatória
- **FR-014**: Sistema DEVE impedir ajustes manuais sem justificativa
- **FR-015**: Sistema DEVE manter histórico completo de todas as movimentações do caixa
- **FR-016**: Sistema DEVE exibir página com histórico de partidas
- **FR-017**: Sistema DEVE persistir dados de jogos, jogadores, movimentações e caixa
- **FR-018**: Sistema DEVE permitir visualizar detalhes de um jogo (jogadores, pagamentos)
- **FR-019**: Sistema DEVE permitir editar o valor da quadra por jogo (padrão R$ 90,00)
- **FR-020**: Sistema DEVE exibir alerta visual quando o caixa estiver negativo
- **FR-021**: Sistema DEVE permitir filtrar movimentações por período
- **FR-022**: Sistema DEVE exibir data e hora em cada movimentação do histórico

### Key Entities

- **Jogo**: Representa uma partida de futsal. Atributos: data, status (em andamento, finalizado), valor da quadra (padrão R$ 90,00), lista de presenças, valor total calculado. Relaciona-se com Presença (1:N) e Movimentação Caixa (1:1)

- **Jogador**: Representa uma pessoa que joga. Atributos: nome. Não requer unicidade (pode haver nomes duplicados)

- **Presença**: Representa a participação de um jogador em um jogo. Atributos: jogador (referência), meio de pagamento (PIX ou na quadra), valor pago (editável, padrão R$ 10,00). Relaciona-se com Jogo (N:1) e Jogador (N:1)

- **Movimentação Caixa**: Representa uma entrada ou saída de dinheiro no caixa. Atributos: tipo (entrada, saída, jogo), valor, descrição/justificativa, data/hora. Relaciona-se opcionalmente com Jogo (N:1) quando a movimentação é de um jogo finalizado

- **Caixa**: Representa o saldo atual. Atributo: saldo em reais. Calculado dinamicamente como soma de todas as movimentações

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Gerente consegue registrar um jogo completo (data, presenças, pagamentos, finalizar) em menos de 3 minutos usando dispositivo móvel
- **SC-002**: Sistema calcula o caixa com 100% de precisão, sem erros de cálculo em nenhum cenário
- **SC-003**: Gerente consegue visualizar o estado atual do caixa em menos de 2 segundos ao abrir a home
- **SC-004**: 100% das movimentações do caixa são rastreadas e auditadas no histórico
- **SC-005**: Gerente consegue colar uma lista de 10 nomes do WhatsApp e o sistema processa corretamente em menos de 5 segundos
- **SC-006**: Interface é totalmente responsiva e usável em smartphones (viewport de 360px de largura)
- **SC-007**: Sistema funciona completamente offline com dados mockados (fase inicial front-end only)
- **SC-008**: Gerente consegue identificar rapidamente se o caixa está negativo (feedback visual claro)
- **SC-009**: 90% dos usuários conseguem entender e usar a funcionalidade principal (criar jogo) sem treinamento
- **SC-010**: Sistema mantém histórico completo sem perda de dados ao longo do tempo
