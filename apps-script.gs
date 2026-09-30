// ============================================================
// CONVITE DE CASAMENTO — Lais & Jonathan
// Google Apps Script — Registro de confirmações de presença
//
// INSTRUÇÕES DE INSTALAÇÃO / ATUALIZAÇÃO:
//   1. Abra script.google.com e acesse o projeto vinculado ao Web App.
//   2. Substitua TODO o código existente pelo conteúdo deste arquivo.
//   3. Clique em "Implantar" > "Gerenciar implantações".
//   4. Clique no lápis (editar) na implantação existente.
//   5. Em "Versão", selecione "Nova versão".
//   6. Clique em "Implantar". A URL permanece a mesma.
//
// ESTRUTURA DA PLANILHA (criada automaticamente se não existir):
//   Coluna A: Data/Hora
//   Coluna B: Nome
//   Coluna C: Presença
//   Coluna D: Acompanhante
// ============================================================

// Nome da aba onde os dados serão gravados.
var SHEET_NAME = 'Confirmações';

// ── doGet ────────────────────────────────────────────────────
// Recebe requisições GET com os dados em query string.
// Método principal para mobile (pixel beacon / fetch GET).
// Exemplo: ?nome=João&presenca=Sim&acompanhante=Não
// ─────────────────────────────────────────────────────────────
function doGet(e) {
  // Verificação de status (sem parâmetros)
  if (!e.parameter || !e.parameter.nome) {
    return jsonResponse({ ok: true, status: 'online' });
  }

  return processarConfirmacao(e.parameter);
}

// ── doPost ───────────────────────────────────────────────────
// Recebe requisições POST com dados em JSON ou form-urlencoded.
// Mantido para compatibilidade com desktop.
// ─────────────────────────────────────────────────────────────
function doPost(e) {
  var params = {};

  try {
    // Tenta ler como JSON primeiro
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (_) {
        // Fallback: parâmetros de formulário
        params = e.parameter || {};
      }
    } else {
      params = e.parameter || {};
    }
  } catch (err) {
    return jsonResponse({ ok: false, erro: 'Erro ao ler dados: ' + err.message });
  }

  return processarConfirmacao(params);
}

// ── processarConfirmacao ─────────────────────────────────────
// Valida os dados e grava na planilha.
// Usado tanto pelo doGet quanto pelo doPost.
// ─────────────────────────────────────────────────────────────
function processarConfirmacao(params) {
  try {
    var nome         = ((params.nome         || '') + '').trim();
    var presenca     = ((params.presenca     || 'Sim') + '').trim();
    var acompanhante = ((params.acompanhante || 'Não') + '').trim();

    if (!nome) {
      return jsonResponse({ ok: false, erro: 'Nome não informado' });
    }

    // Acessa a planilha vinculada ao script
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Cria a aba e o cabeçalho se não existirem
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Data/Hora', 'Nome', 'Presença', 'Acompanhante']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }

    // Data/hora no fuso de Brasília
    var agora = Utilities.formatDate(
      new Date(),
      'America/Sao_Paulo',
      'dd/MM/yyyy HH:mm:ss'
    );

    // Grava a linha
    sheet.appendRow([agora, nome, presenca, acompanhante]);

    Logger.log('Registrado: ' + nome + ' | ' + presenca + ' | ' + acompanhante);

    return jsonResponse({ ok: true, mensagem: 'Registrado com sucesso' });

  } catch (err) {
    Logger.log('Erro processarConfirmacao: ' + err.message);
    return jsonResponse({ ok: false, erro: err.message });
  }
}

// ── jsonResponse ─────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
