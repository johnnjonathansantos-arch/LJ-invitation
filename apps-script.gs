// ============================================================
// CONVITE DE CASAMENTO — Lais & Jonathan
// Google Apps Script — Registro de confirmações de presença
//
// INSTRUÇÕES DE INSTALAÇÃO:
//   1. Abra script.google.com e abra o projeto vinculado a este Web App.
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
// Se a aba não existir, ela será criada automaticamente.
var SHEET_NAME = 'Confirmações';

/**
 * Recebe requisições POST do convite.
 * Aceita tanto JSON (application/json) quanto
 * form-urlencoded (application/x-www-form-urlencoded).
 */
function doPost(e) {
  try {
    var nome         = '';
    var presenca     = 'Sim';
    var acompanhante = 'Não';

    // ── Tentar ler como JSON primeiro ─────────────────────
    if (e.postData && e.postData.contents) {
      try {
        var dados = JSON.parse(e.postData.contents);
        nome         = (dados.nome         || '').toString().trim();
        presenca     = (dados.presenca     || 'Sim').toString().trim();
        acompanhante = (dados.acompanhante || 'Não').toString().trim();
      } catch (jsonErr) {
        // Não é JSON — tenta como parâmetros de formulário
        nome         = (e.parameter.nome         || '').toString().trim();
        presenca     = (e.parameter.presenca     || 'Sim').toString().trim();
        acompanhante = (e.parameter.acompanhante || 'Não').toString().trim();
      }
    } else {
      // Fallback: parâmetros de URL/formulário
      nome         = (e.parameter.nome         || '').toString().trim();
      presenca     = (e.parameter.presenca     || 'Sim').toString().trim();
      acompanhante = (e.parameter.acompanhante || 'Não').toString().trim();
    }

    // ── Validar nome ──────────────────────────────────────
    if (!nome) {
      return jsonResponse({ ok: false, erro: 'Nome não informado' });
    }

    // ── Acessar planilha ──────────────────────────────────
    // getActiveSpreadsheet() funciona automaticamente quando o script
    // está vinculado a uma planilha (não precisa de SPREADSHEET_ID).
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Criar aba e cabeçalho se não existirem
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Data/Hora', 'Nome', 'Presença', 'Acompanhante']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }

    // ── Data/hora no fuso de Brasília ─────────────────────
    var agora = Utilities.formatDate(
      new Date(),
      'America/Sao_Paulo',
      'dd/MM/yyyy HH:mm:ss'
    );

    // ── Gravar linha ──────────────────────────────────────
    sheet.appendRow([agora, nome, presenca, acompanhante]);

    return jsonResponse({ ok: true, mensagem: 'Registrado com sucesso' });

  } catch (err) {
    Logger.log('Erro doPost: ' + err.message);
    return jsonResponse({ ok: false, erro: err.message });
  }
}

/**
 * Responde ao GET de verificação (e também ao preflight do browser).
 */
function doGet(e) {
  return jsonResponse({ ok: true, status: 'online' });
}

/**
 * Cria uma resposta JSON com headers permissivos para CORS.
 */
function jsonResponse(obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
