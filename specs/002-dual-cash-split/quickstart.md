# Quickstart: 002-dual-cash-split

**Como testar** esta feature manualmente após implementação.

---

## Prerequisites

```bash
git checkout 002-dual-cash-split
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador (modo desktop ou DevTools dispositivo móvel).

---

## US1 — Dashboard exibe breakdown por caixa

1. Abra o app — o dashboard já deverá ter dados de seed atualizados.
2. Verifique que o saldo total é exibido em destaque (ex: R$ 150,00).
3. Abaixo do saldo, verifique a linha menor: **"Quadra R$ 60,00 · ADM R$ 90,00"**.
4. Verifique que a soma das duas partes é igual ao saldo total.

**Cenário de saldo negativo**: edite o seed para ter `courtBalance` negativo → verifique que a sub-linha aparece em vermelho (`brand-red`).

---

## US2 — Finalização de jogo roteia pagamentos

1. Clique em **"Criar Jogo"**.
2. Adicione 3 jogadores:
   - Jogador A: **Na Quadra**, R$ 10
   - Jogador B: **Na Quadra**, R$ 10
   - Jogador C: **PIX**, R$ 10
3. Clique em **"Finalizar Jogo"**.
4. Volte ao dashboard e verifique:
   - Caixa Quadra aumentou R$ **20,00** (jogadores A + B)
   - Caixa ADM aumentou R$ **10,00** (jogador C)
   - Saldo total aumentou R$ **30,00**

---

## US3 — Saque do caixa quadra

### 3a: Transferência para ADM

1. Com `courtBalance > 0` no dashboard, clique em **"Saque Quadra"**.
2. Selecione **"Transferir para ADM"**.
3. Informe um valor menor ou igual ao saldo da quadra (ex: R$ 20,00).
4. Clique em **"Confirmar saque"**.
5. Verifique:
   - Caixa Quadra diminuiu R$ 20
   - Caixa ADM aumentou R$ 20
   - Saldo total **não mudou**
   - No histórico aparece registro "Quadra → ADM R$ 20,00"

### 3b: Abatimento em jogo pendente

1. Crie um jogo e salve como **pendente** (sem finalizar).
2. Clique em **"Saque Quadra"** no dashboard.
3. Selecione **"Abater em jogo pendente"**.
4. Selecione o jogo pendente criado e informe o valor do abatimento.
5. Clique em **"Confirmar saque"**.
6. Verifique:
   - Caixa Quadra diminuiu pelo valor abatido
   - Ao abrir o jogo, o custo efetivo exibido já reflete o abatimento

### 3c: Saldo insuficiente (erro esperado)

1. Tente sacar um valor maior que o `courtBalance`.
2. Botão de confirmação deve estar **desabilitado** (ou exibir erro ao tentar).

---

## Ajuste manual com seleção de caixa

1. Acesse **"Ajustar Caixa"**.
2. Escolha **Entrada** e preencha valor + justificativa.
3. Observe o seletor **"Caixa: [ADM] [Quadra]"** — default ADM.
4. Selecione **Quadra** e confirme.
5. Verifique que o `courtBalance` no dashboard aumentou corretamente.

---

## Histórico de movimentações

1. Acesse **Histórico → Movimentações**.
2. Verifique que transferências aparecem com badge **"Quadra → ADM"**.
3. Verifique que transações de jogo aparecem com a etiqueta do caixa correto.
