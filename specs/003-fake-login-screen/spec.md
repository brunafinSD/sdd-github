# Feature Specification: Tela de Login Fake

**Feature Branch**: `003-fake-login-screen`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "criar login fake com usuario e senha predefinidos, pode ser hard code, usuario: parceriasdojoguinho senha: futdaquinta. preciso de uma tela de login com logo e formulario para logar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acesso com credenciais corretas (Priority: P1)

Um membro do grupo acessa o app e ve a tela de login. Ele digita o usuario e senha corretos e e redirecionado para o Dashboard principal.

**Why this priority**: E o caminho critico — sem isso o app nao abre para ninguem.

**Independent Test**: Abrindo o app, preenchendo as credenciais corretas e verificando que o Dashboard aparece.

**Acceptance Scenarios**:

1. **Given** o usuario nao esta autenticado, **When** acessa qualquer rota do app, **Then** e redirecionado para a tela de login.
2. **Given** a tela de login esta exibida, **When** o usuario digita `parceriasdojoguinho` / `futdaquinta` e confirma, **Then** e redirecionado para o Dashboard e a tela de login nao aparece mais.
3. **Given** o usuario esta autenticado, **When** tenta navegar diretamente para `/login`, **Then** e redirecionado para o Dashboard.

---

### User Story 2 - Tentativa com credenciais erradas (Priority: P2)

Um usuario digita usuario ou senha incorretos e o app o impede de entrar, exibindo uma mensagem de erro clara.

**Why this priority**: Protecao minima necessaria para a credencial funcionar como barreira de acesso.

**Independent Test**: Preencher credenciais invalidas e verificar que o acesso e negado e a mensagem de erro aparece.

**Acceptance Scenarios**:

1. **Given** a tela de login esta exibida, **When** o usuario submete credenciais incorretas, **Then** uma mensagem de erro como "Usuario ou senha invalidos" e exibida e o usuario permanece na tela de login.
2. **Given** a mensagem de erro esta visivel, **When** o usuario corrige as credenciais e submete, **Then** acesso e concedido normalmente.
3. **Given** a tentativa falhou, **When** o usuario analisa a mensagem, **Then** a mensagem nao revela qual campo esta errado.

---

### User Story 3 - Sessao persistida entre recarregamentos (Priority: P3)

Um usuario ja autenticado fecha a aba ou recarrega o app e continua vendo o Dashboard, sem precisar logar novamente.

**Why this priority**: Melhora a usabilidade para uso frequente no dia do jogo.

**Independent Test**: Autenticar, recarregar a pagina e confirmar que o Dashboard e exibido diretamente.

**Acceptance Scenarios**:

1. **Given** o usuario esta autenticado, **When** recarrega a pagina, **Then** o Dashboard e exibido diretamente.
2. **Given** o usuario quer sair, **When** utiliza a opcao de logout, **Then** a sessao e encerrada e a tela de login e exibida.
3. **Given** a sessao foi encerrada, **When** o usuario tenta acessar qualquer rota protegida, **Then** e redirecionado para a tela de login.

---

### Edge Cases

- O que acontece se o formulario for submetido com campos em branco? Validacao local impede o envio e exibe indicacao dos campos obrigatorios.
- O que acontece se o usuario copiar e colar espacos extras no campo? O sistema remove espacos nas bordas (trim) antes de validar.
- O que acontece se o usuario usar capitalizacao diferente? A comparacao e sensivel a maiusculas/minusculas — `Parceriasdojoguinho` nao deve ser aceito.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O app DEVE exibir a tela de login com a logo/nome do app e um formulario com campos de usuario e senha quando o usuario nao estiver autenticado.
- **FR-002**: O sistema DEVE validar as credenciais inseridas contra os valores fixos predefinidos (`parceriasdojoguinho` / `futdaquinta`), com comparacao sensivel a maiusculas/minusculas após trim.
- **FR-003**: Ao autenticar com sucesso, o usuario DEVE ser redirecionado para o Dashboard e todas as rotas do app DEVEM estar acessiveis.
- **FR-004**: Ao falhar a autenticacao, o sistema DEVE exibir mensagem generica de erro sem indicar qual campo esta incorreto.
- **FR-005**: A sessao autenticada DEVE ser persistida localmente de modo que um recarregamento da pagina nao exija novo login.
- **FR-006**: O sistema DEVE oferecer uma acao de logout que encerre a sessao e redirecione para a tela de login.
- **FR-007**: Todas as rotas do app DEVEM ser protegidas — acesso sem autenticacao redireciona para a tela de login.
- **FR-008**: O formulario DEVE validar campos obrigatorios antes de submeter, impedindo envio com campos vazios.

### Key Entities

- **Sessao**: Representa o estado autenticado do usuario. Atributo: esta autenticado (sim/nao). Sem dados de usuario individuais, pois ha apenas um conjunto de credenciais compartilhado.
- **Credenciais**: Valores fixos codificados no app (usuario e senha). Nao armazenados em backend.

## Assumptions

- O app tem uma unica conta compartilhada pelo grupo — nao ha multiplos usuarios individuais.
- A logo sera o nome "Fut da quinta" exibido de forma destacada, nao ha arquivo de imagem separado.
- Logout sera acessivel via acao na UI existente (ex: Header ou menu) — localizacao exata definida no planejamento.
- Espacos extras nas bordas dos campos sao removidos antes da validacao (trim).
- A persistencia de sessao usa armazenamento local do dispositivo, sem expiracao de tempo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O acesso com credenciais corretas redireciona para o Dashboard em menos de 1 segundo apos a confirmacao.
- **SC-002**: Qualquer combinacao de credenciais incorretas resulta em 100% de bloqueio de acesso.
- **SC-003**: Apos autenticacao, um recarregamento completo da pagina mantem o usuario no Dashboard sem exigir novo login.
- **SC-004**: Todas as rotas internas do app redirecionam para a tela de login quando acessadas sem autenticacao.
- **SC-005**: O formulario nunca e submetido com campos em branco — validacao ocorre antes do envio.
