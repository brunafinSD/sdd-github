# Feature Specification: Caixas Separados — Quadra e ADM

**Feature Branch**: `002-dual-cash-split`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "Caixa separado entre quadra e adm: pagamentos Na Quadra vão para caixa quadra, pagamentos PIX vão para caixa adm. Dashboard mostra soma total e breakdown separado. Possibilidade de sacar o valor da quadra, abatendo no jogo ou transferindo para caixa adm."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Dashboard exibe saldo total e breakdown por caixa (Priority: P1)

O gestor abre o app e vê o saldo consolidado do time, mas também consegue identificar instantaneamente quanto está no caixa da quadra e quanto está no caixa da administração, sem precisar navegar para outra tela.

**Why this priority**: Sem visibilidade do breakdown, o gestor não sabe se há dinheiro disponível para pagar a quadra ou se há saldo administrativo para despesas. É o valor de negócio mais imediato.

**Independent Test**: Com jogos finalizados contendo pagamentos mistos (Na Quadra + PIX), acessar o dashboard e verificar que o saldo total é exibido em destaque e, abaixo dele em fonte menor, os valores "Quadra: R$ X" e "ADM: R$ Y" são listados corretamente.

**Acceptance Scenarios**:

1. **Dado** que existem transações de jogos com pagamentos Na Quadra e PIX, **Quando** o usuário acessa o dashboard, **Então** o saldo total exibido é a soma dos dois caixas, e abaixo aparece o detalhamento "Quadra: R$ X | ADM: R$ Y".
2. **Dado** que o caixa quadra é zero e o ADM tem saldo, **Quando** o usuário vê o dashboard, **Então** ambos os valores são exibidos corretamente, inclusive o zero.
3. **Dado** que ambos os caixas são negativos, **Quando** o usuário vê o dashboard, **Então** o saldo total é negativo e o detalhamento mostra ambos os valores negativos com a cor de alerta.

---

### User Story 2 — Finalização de jogo roteia pagamentos para o caixa correto (Priority: P2)

Ao finalizar um jogo, cada jogador já marcou seu método de pagamento (Na Quadra ou PIX). O sistema distribui automaticamente os valores: pagamentos Na Quadra somam ao caixa quadra, pagamentos PIX somam ao caixa ADM. O gestor não precisa fazer nenhuma ação manual.

**Why this priority**: É o mecanismo central que alimenta os dois caixas. Sem isso, o breakdown do dashboard não tem dados.

**Independent Test**: Criar um jogo com 3 jogadores — 2 pagando Na Quadra (R$ 10 cada) e 1 via PIX (R$ 10). Finalizar e verificar que caixa quadra aumenta R$ 20 e caixa ADM aumenta R$ 10.

**Acceptance Scenarios**:

1. **Dado** um jogo finalizado com 2 pagamentos Na Quadra (R$ 10 cada) e 1 PIX (R$ 10), **Quando** o jogo é finalizado, **Então** o caixa quadra recebe R$ 20 e o caixa ADM recebe R$ 10.
2. **Dado** um jogo onde todos pagam via PIX, **Quando** o jogo é finalizado, **Então** somente o caixa ADM é afetado; o caixa quadra permanece inalterado.
3. **Dado** um jogo onde todos pagam Na Quadra, **Quando** o jogo é finalizado, **Então** somente o caixa quadra é afetado; o caixa ADM permanece inalterado.

---

### User Story 3 — Saque do caixa quadra (Priority: P3)

Quando há dinheiro acumulado no caixa quadra (dinheiro físico recolhido na quadra), o gestor pode "sacar" esse valor de duas formas:

- **Abater no jogo**: o valor da quadra é deduzido do custo da partida atual, reduzindo o que os jogadores precisam pagar.
- **Transferir para caixa ADM**: move o saldo da quadra para o caixa de administração, registrando como uma transferência interna.

**Why this priority**: Permite que o dinheiro físico coletado na quadra seja formalizado no sistema, evitando divergência entre saldo digital e dinheiro real.

**Independent Test**: Com caixa quadra de R$ 60, realizar um saque de R$ 60 para o caixa ADM e verificar que: caixa quadra vai a zero, caixa ADM aumenta R$ 60, e o saldo total permanece inalterado.

**Acceptance Scenarios**:

1. **Dado** que o caixa quadra tem R$ 60, **Quando** o gestor realiza um saque de R$ 60 para o caixa ADM, **Então** o caixa quadra fica zerado, o caixa ADM aumenta R$ 60, o saldo total não muda, e uma transação de transferência é registrada no histórico.
2. **Dado** que o caixa quadra tem R$ 60 e há um jogo pendente com custo de R$ 90, **Quando** o gestor abate R$ 60 do caixa quadra no jogo, **Então** o custo efetivo da partida é reduzido para R$ 30 e o caixa quadra é debitado em R$ 60.
3. **Dado** que o gestor tenta sacar R$ 100 de um caixa quadra com R$ 60, **Quando** confirma a operação, **Então** o sistema bloqueia e exibe mensagem de saldo insuficiente no caixa quadra.
4. **Dado** um saque realizado, **Quando** o gestor acessa o histórico, **Então** a transferência aparece com tipo "Transferência Quadra → ADM" e o valor correspondente.

---

### Edge Cases

- Saque parcial (ex: sacar R$ 30 de um saldo de R$ 60) deve ser permitido.
- Ajustes manuais de caixa (entradas e saídas) devem exigir seleção do caixa destino (Quadra ou ADM).
- Se o custo da quadra for alterado em um jogo pendente que já sofreu abatimento, o abatimento deve ser recalculado ou invalidado.
- Transferência de valor zero entre caixas deve ser bloqueada.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE manter dois sub-caixas independentes: **Caixa Quadra** e **Caixa ADM**, além do saldo total consolidado (soma dos dois).
- **FR-002**: Ao finalizar um jogo, o sistema DEVE contabilizar os valores pagos "Na Quadra" no Caixa Quadra e os valores pagos via "PIX" no Caixa ADM, automaticamente.
- **FR-003**: O dashboard DEVE exibir o saldo total em destaque e, em fonte menor, o detalhamento "Quadra: R$ X | ADM: R$ Y".
- **FR-004**: O sistema DEVE permitir saque do Caixa Quadra em duas modalidades: (a) transferência para Caixa ADM ou (b) abatimento no custo de um jogo pendente.
- **FR-005**: Um saque do Caixa Quadra DEVE ser bloqueado se o valor solicitado for maior que o saldo disponível no Caixa Quadra.
- **FR-006**: Toda transferência entre caixas DEVE ser registrada no histórico de movimentações com tipo, valor e data identificados.
- **FR-007**: Ajustes manuais de caixa DEVEM exigir seleção do caixa destino (Quadra ou ADM); o padrão é ADM.
- **FR-008**: O saldo total exibido DEVE ser sempre igual à soma do Caixa Quadra e do Caixa ADM.

### Key Entities

- **CaixaQuadra**: Dinheiro físico recolhido na quadra. Saldo próprio, alimentado por pagamentos "Na Quadra" e reduzido por saques.
- **CaixaAdm**: Caixa administrativo. Saldo próprio, alimentado por pagamentos PIX, entradas manuais e transferências do Caixa Quadra.
- **Transferência**: Movimentação interna entre Caixa Quadra → Caixa ADM. Não altera o saldo total; redistribui entre sub-caixas.
- **AbatimentoQuadra**: Uso do saldo do Caixa Quadra para reduzir o custo de um jogo pendente. Debita o Caixa Quadra e diminui o cashImpact do jogo.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O gestor identifica o saldo de cada caixa (quadra e ADM) na tela inicial, sem nenhuma navegação adicional.
- **SC-002**: Ao finalizar qualquer jogo, 100% dos valores são roteados ao caixa correto sem intervenção manual do gestor.
- **SC-003**: Uma operação de saque do caixa quadra (transferência ou abatimento) é concluída em menos de 3 toques na tela.
- **SC-004**: O saldo total exibido no dashboard é sempre igual à soma dos dois sub-caixas, sem discrepâncias.
- **SC-005**: Todas as transferências entre caixas aparecem no histórico com identificação clara do tipo de operação.

---

## Assumptions

- O custo da quadra (courtCost) é referência para o jogo; o breakdown por caixa é determinado apenas pelo método de pagamento de cada jogador.
- Ajustes manuais de caixa existentes serão migrados para exigir seleção de caixa destino; o padrão será ADM para preservar comportamento atual.
- Saque parcial (valor menor que o saldo do Caixa Quadra) é permitido.
