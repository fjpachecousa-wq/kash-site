# KASH Site — Entrega unificada (refactor leve)

## O que foi feito
- Mantido **layout 100% igual** (tipografia, cores, espaçamentos).
- Extraída a **lógica** do App.jsx:
  - `src/utils/collector.js`: lê `kashId` e `companyName` do navegador (localStorage/inputs/contrato).
  - `src/services/sheets.js`: envia para **Google Apps Script**.
- **“Concluir (teste)”** chama `handleConcludeTest_KASH()` que usa as funções acima.
- **KASH FLOW 30** e **KASH SCALE 5** → **Divulgação** (CTA desativado).

## Variáveis de ambiente (Vercel)
- `VITE_APPS_SCRIPT_URL` → URL do seu Web App no Google Apps Script.
- (futuro) `STRIPE_PUBLIC_KEY`, `STRIPE_PRICE_ID`.

## Como publicar
1. Substitua o repositório no GitHub por estes arquivos.
2. Configure `VITE_APPS_SCRIPT_URL` na Vercel (Project → Settings → Environment Variables):
   - Produção e Preview.
3. Deploy: commit na `main`.

## Teste rápido
- Acesse `/` → clique **Concluir (teste)**.
- Verifique no Google Sheets:
  - **Processos**: `kashId`, `companyName`, `faseAtual`, `subFase`, `atualizadoEm` (BR).
  - **Histórico**: `timestamp` (BR), `acao=create`, `kashId`, `companyName`.