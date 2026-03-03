# Feature Specification: Padronização de Layout e Consistência de Tema

**Feature Branch**: `004-theme-consistency`  
**Created**: 2026-03-03  
**Status**: Draft  
**Input**: User description: "preciso padronizar o layout. Usar as cores do tema. Problemas identificados: na lista de movimentações o vermelho do valor negativo não é do tema. Analisar se eixstem outros problemas de consistencia de layout"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cores semânticas consistentes na lista de movimentações (Priority: P1)

O usuário acessa a lista de movimentações e observa os valores de cada transação. Valores negativos (saídas) devem aparecer na cor coral do tema, igual às demais indicações de perigo/alerta do app (badges, alertas de saldo negativo). Atualmente o vermelho exibido é diferente do restante da interface reforçando uma inconsistência visual.

**Why this priority**: É o único problema de cor explicitamente identificado pelo usuário. Causa ruptura visual imediata porque o mesmo conceito semântico ("negativo/perigo") aparece com duas cores diferentes na mesma tela.

**Independent Test**: Pode ser testado isoladamente navegando à lista de movimentações e verificando se a cor do valor negativo é visualmente idêntica ao vermelho do badge "Saída" na mesma linha.

**Acceptance Scenarios**:

1. **Given** uma movimentação de saída (valor negativo) na lista, **When** o usuário visualiza a lista de movimentações, **Then** o valor negativo é exibido na mesma cor coral definida no tema para estados de perigo/negativo.
2. **Given** a cor coral do tema (brand-red), **When** o usuário compara o valor negativo da lista com o badge "Saída" na mesma linha, **Then** ambos são visualmente idênticos na tonalidade.
3. **Given** uma movimentação positiva (valor positivo), **When** o usuário visualiza a lista, **Then** a cor verde do valor positivo permanece inalterada e consistente com outros indicadores positivos do app.

---

### User Story 2 - Auditoria e correção de todas as inconsistências de cores (Priority: P2)

O usuário navega por todas as telas do app (Dashboard, Histórico de Jogos, Histórico de Movimentações, Detalhe do Jogo, Criar Jogo, Ajuste de Caixa) e espera que todos os elementos coloridos sigam a paleta definida no tema: azul-navy para primário, verde-água para positivo/sucesso, coral para negativo/perigo, âmbar para pendente/atenção.

**Why this priority**: Consolida a credibilidade visual do produto. Após corrigir o problema da lista de movimentações (P1), uma auditoria completa garante que não existam outras inconsistências remanescentes.

**Independent Test**: Pode ser testado percorrendo cada tela do app e verificando se nenhum elemento colorido semântico (indicadores de positivo, negativo, pendente, primário) faz uso de cores fora da paleta do tema.

**Acceptance Scenarios**:

1. **Given** qualquer tela do app, **When** o usuário visualiza indicadores com significado semântico (positivo, negativo, atenção, primário), **Then** todos utilizam exclusivamente as cores definidas na paleta oficial do tema.
2. **Given** textos secundários e informacionais (datas, subtítulos, rótulos auxiliares), **When** o usuário os visuaiza, **Then** são exibidos em tons neutros de cinza consistentes entre si em toda a aplicação.
3. **Given** estados interativos (hover, foco, desabilitado), **When** o usuário interage com elementos clicáveis, **Then** os estados visuais são uniformes em componentes equivalentes em diferentes telas.

---

### Edge Cases

- O que acontece com elementos que usam cinza padrão do sistema de design (texto secundário, bordas, fundos desabilitados) que não são semânticos — esses devem permanecer inalterados, pois são utilitários neutros, não indicadores de estado.
- Valores zero em movimentações ou saldos — devem ter cor neutra (texto escuro padrão), sem confundir com positivo ou negativo.
- Transferência "Quadra → ADM" é neutra e não deve ser colorida como positiva ou negativa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE exibir valores negativos na lista de movimentações utilizando exclusivamente a cor de perigo/negativo definida na paleta oficial do tema.
- **FR-002**: O sistema DEVE exibir valores positivos na lista de movimentações utilizando exclusivamente a cor de sucesso definida na paleta oficial do tema.
- **FR-003**: O sistema DEVE exibir valores de transações do tipo transferência (Quadra → ADM) na cor de texto padrão (brand-gray-dark), sem conotação positiva ou negativa.
- **FR-004**: O sistema DEVE garantir que todos os componentes que indicam estado semântico (positivo, negativo, atenção, primário) em qualquer tela utilizem exclusivamente as cores correspondentes da paleta oficial do tema.
- **FR-005**: Textos auxiliares, datas, rótulos secundários e bordas DEVEM usar tons neutros de cinza consistentes em toda a aplicação — mudanças nesses elementos são permitidas apenas quando necessário para uniformidade entre telas equivalentes.
- **FR-006**: O sistema DEVE garantir que o comportamento visual em estados interativos (hover, foco) seja uniforme em componentes equivalentes (ex.: listas clicáveis em Histórico de Jogos e Histórico de Movimentações).

### Assumptions

- A paleta do tema é definida em `theme.config.mjs` e refletida em `src/index.css` com tokens CSS — essa é a fonte única de verdade para as cores semânticas.
- Tons neutros de cinza padrão do sistema de design (ex.: cinza para texto secundário, fundos de hover, bordas leves) são aceitáveis enquanto forem semanticamente neutros e visualmente consistentes.
- Não estão no escopo desta feature: redesign de layout/tipografia, alteração de espaçamentos, adição de novos componentes ou mudança na paleta de cores em si.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das telas do app, todos os valores negativos (saldos e movimentações) são exibidos na mesma tonalidade de coral, visualmente indistinguíveis entre si.
- **SC-002**: Em 100% das telas do app, todos os valores positivos são exibidos na mesma tonalidade de verde, visualmente indistinguíveis entre si.
- **SC-003**: Nenhum elemento com significado semântico (positivo, negativo, atenção, primário) exibe cor fora da paleta oficial do tema em qualquer tela da aplicação.
- **SC-004**: A aparência visual da lista de movimentações e do histórico de jogos é percebida como coerente por qualquer usuário que compare as duas telas lado a lado.
