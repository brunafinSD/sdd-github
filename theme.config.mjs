/**
 * Paleta de cores do Futsal Cash Manager — FONTE ÚNICA DE VERDADE
 *
 * Para trocar uma cor, edite apenas o hex aqui e rode:
 *   npm run generate-icons   ← regenera splash screens
 *   npm run build            ← atualiza manifest PWA e meta theme-color
 *
 * As classes Tailwind (text-brand-blue, bg-brand-green, etc.) leem de
 * src/index.css (@theme). Mantenha os valores em sincronia com este arquivo.
 */
export const theme = {
  /** Primário — botões, header, abas ativas, manifest theme_color */
  colorPrimary:  '#272d4d',  // brand-blue   → navy escuro

  /** Positivo — saldo positivo, jogo concluído, valores a receber */
  colorSuccess:  '#35997e',  // brand-green  → verde-água suave

  /** Negativo/alertas/erros/atenção — saídas, saldo negativo */
  colorDanger:   '#ff6a5a',  // brand-red    → coral

  /** Pendente — jogos em aberto, pagamento "Na Quadra" */
  colorWarning:  '#ffb350',  // brand-yellow → âmbar

  /** Texto escuro / fundo nav */
  colorGrayDark: '#1F2937',  // brand-gray-dark

  /** Fundo geral / cards */
  colorGrayLight:'#F3F4F6',  // brand-gray-light

  /** Fundo de superfícies / seções — cinza clarinho */
  colorBg:       '#F5F6F8',  // brand-bg
}
