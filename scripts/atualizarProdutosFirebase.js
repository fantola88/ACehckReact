const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// IMPORTANTE: Substitua pelos seus dados reais do Firebase
// Use variáveis de ambiente ou um arquivo de configuração separado
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Verifica se as variáveis de ambiente estão configuradas
if (!process.env.FIREBASE_API_KEY || !process.env.FIREBASE_DATABASE_URL) {
  console.error("❌ ERRO: Variáveis de ambiente do Firebase não configuradas!");
  console.error("Crie um arquivo .env com as seguintes variáveis:");
  console.error("FIREBASE_API_KEY=sua_api_key_aqui");
  console.error("FIREBASE_AUTH_DOMAIN=seu_auth_domain_aqui");
  console.error("FIREBASE_DATABASE_URL=sua_database_url_aqui");
  console.error("FIREBASE_PROJECT_ID=seu_project_id_aqui");
  console.error("FIREBASE_STORAGE_BUCKET=seu_storage_bucket_aqui");
  console.error("FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id_aqui");
  console.error("FIREBASE_APP_ID=seu_app_id_aqui");
  process.exit(1);
}
// Seus produtos - copie do arquivo produtos.ts
const produtos = [
  { almox: "Almoxarifado Central", cod: "03.22.01.0006-6", nome: "AÇÚCAR REFINADO 1Kg", unid: "QUILOGRAMA" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0210-6", nome: "AÇUCAREIRO DE AÇO INOXIDÁVEL - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0044-2", nome: "ADESIVO MONOMÉRICO (BRANCO)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0042-6", nome: "ADESIVO MONOMÉRICO (DOURADO)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0046-9", nome: "ADESIVO MONOMÉRICO (PRATA ESCOVADO)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0045-0", nome: "ADESIVO MONOMÉRICO (PRATA)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0043-4", nome: "ADESIVO MONOMÉRICO (PRETO)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.22.01.0005-8", nome: "ADOÇANTE ARTIFICIAL - Frasco", unid: "FRASCO" },
    { almox: "Almoxarifado Central", cod: "03.28.09.0556-7", nome: "ALCOOL ETÍLICO para limpeza - 1 Litro", unid: "LITRO" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0012-7", nome: "BANDEIRA DA BAHIA DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0014-3", nome: "BANDEIRA DA PARAÍBA DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0058-5", nome: "BANDEIRA DE ALAGOAS DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0068-2", nome: "BANDEIRA DE AMAPÁ DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0060-7", nome: "BANDEIRA DE GOIÁS DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0016-0", nome: "BANDEIRA DE MINAS GERAIS DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0062-3", nome: "BANDEIRA DE PERNAMBUCO DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0064-0", nome: "BANDEIRA DE RONDÔNIA DE 2 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0044-5", nome: "BANDEIRA DE RORAIMA DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0018-6", nome: "BANDEIRA DE SANTA CATARINA DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0020-8", nome: "BANDEIRA DE SÃO PAULO DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0022-4", nome: "BANDEIRA DE SERGIPE DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0026-7", nome: "BANDEIRA DO ACRE DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0066-6", nome: "BANDEIRA DO AMAZONAS DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0024-0", nome: "BANDEIRA DO CEARÁ DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0050-0", nome: "BANDEIRA DO DISTRITO FEDERAL 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0010-0", nome: "BANDEIRA DO ESPÍRITO SANTO 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0032-1", nome: "BANDEIRA DO MARANHÃO DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0028-3", nome: "BANDEIRA DO MATO GROSSO DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0030-5", nome: "BANDEIRA DO MATO GROSSO DO SUL 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0182-4", nome: "BANDEIRA DO MERCOSUL (02 PANOS) - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0055-0", nome: "BANDEIRA DO MERCOSUL (04 PANOS) - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0034-8", nome: "BANDEIRA DO PARÁ DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0036-4", nome: "BANDEIRA DO PARANÁ DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0038-0", nome: "BANDEIRA DO PIAUÍ DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0054-2", nome: "BANDEIRA DO RIO DE JANEIRO DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0042-9", nome: "BANDEIRA DO RIO GRANDE DO NORTE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0040-2", nome: "BANDEIRA DO RIO GRANDE DO SUL 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0075-5", nome: "BANDEIRA DO SENADO FEDERAL (02 PANOS) - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0056-9", nome: "BANDEIRA DO F. DE NORONHA DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0052-6", nome: "BANDEIRA DO TOCANTINS DE 02 PANOS - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0046-1", nome: "BANDEIRA NACIONAL (02 PANOS) - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.43.01.0048-8", nome: "BANDEIRA NACIONAL (04 PANOS) - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0013-1", nome: "BANDEJA EM ACRÍLICO COM 1 ANDAR - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9026-3", nome: "BANDEJA EM ACRÍLICO COM 2 ANDARES - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0209-2", nome: "BANDEJA INOX 30CM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9417-0", nome: "Bandeja Multiuso 17 litros", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9416-1", nome: "Bandeja Multiuso 7 litros", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9063-8", nome: "BARBANTE COM FIO DE ALGODÃO - ROLO", unid: "ROLO" },
    { almox: "Almoxarifado Central", cod: "03.01.02.0007-2", nome: "BLOCO 1/2 OFÍCIO PAUTADO SF 15x21cm", unid: "BLOCO" },
    { almox: "Almoxarifado Central", cod: "03.01.02.0006-4", nome: "BLOCO 1/2 OFÍCIO TIMBRADO SF 15x21cm", unid: "BLOCO" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9058-1", nome: "BLOCO AUTO ADESIVO (POST-IT) GRANDE", unid: "BLOCO" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9057-3", nome: "BLOCO AUTO ADESIVO (POST-IT) PEQUENO", unid: "BLOCO" },
    { almox: "Almoxarifado Central", cod: "03.01.02.0002-1", nome: "BLOCO LEMBRETE TIMBRADO SF 10x15 cm", unid: "BLOCO" },
    { almox: "Almoxarifado Central", cod: "03.01.02.0004-8", nome: "BLOCO OFÍCIO PAUTADO TIMBRADO SF 21x29,5", unid: "BLOCO" },
    { almox: "Almoxarifado Central", cod: "03.01.02.0005-6", nome: "BLOCO OFÍCIO TIMBRADO SF 21x29,5cm", unid: "BLOCO" },
    { almox: "Almoxarifado Central", cod: "03.01.02.0003-0", nome: "BLOCO PARA RECADO TIMBRADO SF 10,5X15", unid: "BLOCO" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0213-0", nome: "BULE EM AÇO (1,2 litros)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.22.01.0007-4", nome: "CAFÉ EM PÓ 500G", unid: "PACOTE" },
    { almox: "Almoxarifado Central", cod: "03.01.04.0010-1", nome: "CAIXA PARA ARQUIVO EM PAPELÃO (PARDA)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.0024-8", nome: "CANETA ESFEROGRÁFICA AZUL", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.0028-0", nome: "CANETA ESFEROGRÁFICA PRETA", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.0032-9", nome: "CANETA ESFEROGRÁFICA VERMELHA", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.0040-0", nome: "CANETA MARCA TEXTO AMARELA", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.0042-6", nome: "CANETA MARCA TEXTO VERDE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0005-1", nome: "CHAPA DE ACRÍLICO AMARELA 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0003-5", nome: "CHAPA DE ACRÍLICO AZUL 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0017-5", nome: "CHAPA DE ACRÍLICO BRANCA 10 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0001-9", nome: "CHAPA DE ACRÍLICO BRANCA 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0011-6", nome: "CHAPA DE ACRÍLICO BRANCA 3MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0014-0", nome: "CHAPA DE ACRÍLICO BRANCA 5 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0023-0", nome: "CHAPA DE ACRÍLICO ESPELHADA AZUL 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0021-3", nome: "CHAPA DE ACRÍLICO ESPELHADA BRONZE 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0018-3", nome: "CHAPA DE ACRÍLICO ESPELHADA DOURADA 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0019-1", nome: "CHAPA DE ACRÍLICO ESPELHADA PRATA 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0020-5", nome: "CHAPA DE ACRÍLICO ESPELHADA ROSÊ 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0022-1", nome: "CHAPA DE ACRÍLICO ESPELHADA VERMELHA 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0008-6", nome: "CHAPA DE ACRÍLICO LARANJA 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0016-7", nome: "CHAPA DE ACRÍLICO PRETA 10 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0002-7", nome: "CHAPA DE ACRÍLICO PRETA 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0010-8", nome: "CHAPA DE ACRÍLICO PRETA 3 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0013-2", nome: "CHAPA DE ACRÍLICO PRETA 5 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0007-8", nome: "CHAPA DE ACRÍLICO ROSA 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0015-9", nome: "CHAPA DE ACRÍLICO TRANSPARENTE 10 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0009-4", nome: "CHAPA DE ACRÍLICO TRANSPARENTE 3 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0012-4", nome: "CHAPA DE ACRÍLICO TRANSPARENTE 5 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0004-3", nome: "CHAPA DE ACRÍLICO VERDE 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0006-0", nome: "CHAPA DE ACRÍLICO VERMELHA 2 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9055-7", nome: "CHAVEIRO DE CLAVICULÁRIO", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9044-1", nome: "CLIPS DE METAL (MÉDIO) - CAIXA 100", unid: "CAIXA" },
    { almox: "Almoxarifado Central", cod: "03.31.03.0001-3", nome: "COADOR PARA CAFÉ", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9066-2", nome: "COLA EM BASTÃO", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0004-9", nome: "COLHER DE CAFÉ INOX", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0202-5", nome: "COLHER DE MADEIRA", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0203-3", nome: "COLHER DE SOPA", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.99.0018-8", nome: "COLHER PARA SUCO INOX", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0207-6", nome: "COPO DE VIDRO PARA ÁGUA (300ml)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.02.0002-7", nome: "COPO DESCARTÁVEL BIODEGRADÁVEL", unid: "PACOTE" },
    { almox: "Almoxarifado Central", cod: "03.31.99.0020-0", nome: "COPO-DE-CRISTAL-PARA-AGUA", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.28.09.0495-1", nome: "DETERGENTE LÍQUIDO 500ml", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.02.0010-2", nome: "ENVELOPE BRANCO AUTOCOLANTE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.28.09.0486-2", nome: "ESPONJA DUPLA FACE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.04.01.0017-3", nome: "Etiqueta Autoadesiva 16 P/ Folha", unid: "PACOTE" },
    { almox: "Almoxarifado Central", cod: "03.04.01.0003-3", nome: "Etiqueta Autoadesiva 27 P/ Folha", unid: "PACOTE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9027-1", nome: "EXTRATOR DE GRAMPO", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0204-1", nome: "FACA DE MESA INOX", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0025-6", nome: "FITA ADESIVA DUPLA FACE VHB 10 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0026-4", nome: "FITA ADESIVA DUPLA FACE VHB 25 MM", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9060-3", nome: "FITA ADESIVA P/ EMPACOTAMENTO 50X50", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9065-4", nome: "FITA CREPE 50X50", unid: "ROLO" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9389-0", nome: "FITA CREPE BRANCA 48mmX50m (SECONTE)", unid: "ROLO" },
    { almox: "Almoxarifado Central", cod: "03.01.04.0014-4", nome: "FITA DUPLA FACE VHB - ROLO 19mmx20m", unid: "ROLO" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0027-2", nome: "FITA DUPLA-FACE LAMINAÇÃO ACRÍLICO 300", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0028-0", nome: "FITA DUPLA-FACE LAMINAÇÃO ACRÍLICO 50", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.28.09.0487-0", nome: "FLANELA BRANCA - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.28.09.0488-9", nome: "FLANELA EM METRO", unid: "METRO" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0219-0", nome: "FUNIL DE PLÁSTICO", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0205-0", nome: "GARFO DE MESA INOX", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0218-1", nome: "GARRAFA TÉRMICA 1,8 Litros", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0001-8", nome: "GRAFITE-HB 0,5mm", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0002-6", nome: "GRAFITE-HB 0,7mm", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0003-4", nome: "GRAFITE-HB 0,9mm", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9033-6", nome: "GRAMPEADOR DE MESA", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9035-2", nome: "GRAMPEADOR SEMI-INDUSTRIAL", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9041-7", nome: "GRAMPO GRAMPEADOR MESA 26X6 - CX 5000", unid: "CAIXA" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9040-9", nome: "GRAMPO SEMI-INDUSTRIAL 24X13 - CX 5000", unid: "CAIXA" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0082-4", nome: "GRAMPO TRANÇADO Nº 1 (TRIUNFO) G", unid: "CAIXA" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0083-2", nome: "GRAMPO TRANÇADO Nº 2 (TRIUNFO) M", unid: "CAIXA" },
    { almox: "Almoxarifado Central", cod: "03.28.09.0491-9", nome: "GUARDANAPO DESCARTÁVEL - PCT 50", unid: "PACOTE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0211-4", nome: "JARRA INOX (2 litros)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0084-0", nome: "LÁPIS 5B PARA TAQUIGRAFIA", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0085-9", nome: "LÁPIS PRETO Nº 2", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0217-3", nome: "LATA PARA MANTIMENTOS EM ALUMÍNIO", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0212-2", nome: "LEITEIRA (FERVEDOR) EM ALUMÍNIO 2L", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0048-5", nome: "MÁSCARA TRANSFERÊNCIA MÉDIO TACK PAPEL", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0047-7", nome: "MÁSCARA TRANSFERÊNCIA TRANSPARENTE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.28.09.0492-7", nome: "MULTIUSO LÍQUIDO (TIPO VEJA)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.28.09.0490-0", nome: "PANO DE COPA (Prato)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.04.0016-0", nome: "PAPEL CONTACT - METRO", unid: "METRO" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9064-6", nome: "PAPEL PARA EMPACOTAMENTO - FOLHA", unid: "FOLHA" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0086-7", nome: "PASTA ARQUIVO TIPO A-Z (ESTREITA)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9050-6", nome: "PASTA ARQUIVO TIPO A-Z (LARGA)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9049-2", nome: "PASTA EM L CRISTAL", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9053-0", nome: "PASTA EM PVC COM ELÁSTICO 05 mm", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9047-6", nome: "PASTA EM PVC COM ELÁSTICO 40 mm", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.02.0009-9", nome: "PASTA TIMBRADA SF OFICIO CARTOLINA", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.99.0017-4", nome: "PERCEVEJO EM AÇO DOURADO - CX 200", unid: "CAIXA" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9036-0", nome: "PERFURADOR MÉDIO", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9017-4", nome: "PINCEL P/ QUADRO BRANCO (AZUL)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9015-8", nome: "PINCEL P/ QUADRO BRANCO (PRETO)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.04.0021-7", nome: "PINCEL P/ QUADRO BRANCO (VERDE)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9018-2", nome: "PINCEL P/ QUADRO BRANCO (VERMELHO)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0214-9", nome: "PORTA COPO INOX", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0095-2", nome: "PRATO - UNIDADE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9031-0", nome: "RÉGUA PLÁSTICA COM 30cm", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.01.41.0261-0", nome: "RESMA DE PAPEL A3 - REPOGRAFIA", unid: "RESMA" },
    { almox: "Almoxarifado Central", cod: "03.01.41.0260-1", nome: "RESMA DE PAPEL A4 - REPOGRAFIA", unid: "RESMA" },
    { almox: "Almoxarifado Central", cod: "03.28.09.0494-3", nome: "SABÃO DE CÔCO - BARRA 200g", unid: "BARRA" },
    { almox: "Almoxarifado Central", cod: "03.01.01.9037-9", nome: "TESOURA PARA CORTAR PAPEL", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.64.09.0144-4", nome: "VELA FILTRO REFIL ORIGINAL C+3 IBBL", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.64.09.0126-6", nome: "VELA PARA FILTRO DE PAREDE (SOFT)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.64.09.0125-8", nome: "VELA PARA FILTRO IBBL", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.64.09.0132-0", nome: "VELA PARA FILTRO LIBELL", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0050-7", nome: "VINIL ADESIVO IMPRESSÃO TRANSPARENTE", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0041-8", nome: "VINIL ADESIVO REFLETIVO (VERMELHO)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.44.02.0049-3", nome: "VINIL AUTO ADESIVO IMPRESSÃO BRANCO", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0206-8", nome: "XÍCARA PARA CAFÉ (com pires)", unid: "UNIDADE" },
    { almox: "Almoxarifado Central", cod: "03.31.01.0092-8", nome: "XÍCARA PARA CHÁ (com pires)", unid: "UNIDADE" },
    
    // ALIMENTÍCIOS
    { almox: "Almoxarifado de Alimentícios", cod: "03.22.01.0008-2", nome: "ÁGUA MINERAL GARRAFÃO 20L", unid: "PACOTE" },
    { almox: "Almoxarifado de Alimentícios", cod: "03.10.13.0020-7", nome: "GARRAFÃO RETORNÁVEL PARA ÁGUA 20L", unid: "PACOTE" },
    
    // MÉDICO
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0047-4", nome: "Abaixador de língua descartável (espátula) - pacote com 100 unidades", unid: "PACOTE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0004-8", nome: "Ácido acetilsalicílico 100 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0045-8", nome: "Adenosina 3 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0045-2", nome: "Água destilada - solução injetável - ampola com 10 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0997-2", nome: "ÁGUA PARA INJEÇÃO FRASCO 250ML", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0029-0", nome: "Agulha hipodérmica 13X4,5", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0025-8", nome: "Agulha hipodérmica 25X7", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0027-4", nome: "Agulha hipodérmica 25X8", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0026-6", nome: "Agulha hipodérmica 30X7", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0062-2", nome: "Agulha hipodérmica 30X8", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0024-0", nome: "Agulha hipodérmica 40X12", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0385-6", nome: "AGULHA INTRAÓSSEA", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0139-4", nome: "Álcool etílico 70% - frasco com 1 litro", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0130-0", nome: "Algodão hidrófilo em bola", unid: "PACOTE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0301-5", nome: "Amiodarona (cloridrato) 50 mg/ml - solução injetável - ampola com 3 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0366-0", nome: "Aparelho de barbear descartável", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.80.01.0006-1", nome: "Ar medicinal - comprimido", unid: "METRO CÚBICO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.03.0040-6", nome: "Atadura crepom 15cm x 4,5m (esticada) ou 15cm x 1,8m (em repouso)", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0038-5", nome: "Atropina (sulfato) 0,25 mg/ml - solução injetável - ampola com 1 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1004-0", nome: "AVENTAL DE MANGA CURTA", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0137-8", nome: "Avental descartável - Unidade", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.04.0004-1", nome: "Benzilpenicilina benzatina 1.200.000 UI - pó para suspensão injetável", unid: "FRASCO AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.04.0008-4", nome: "Benzilpenicilina procaína 300.000 UI + benzilpenicilina potássica 100.000 UI - pó para suspensão injetável - frasco-ampola", unid: "FRASCO AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0111-6", nome: "Bicarbonato de sódio 8,4% - solução injetável - ampola com 10 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0079-9", nome: "Bolsa coletora de urina - sistema aberto", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0364-3", nome: "Bolsa de água quente", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0380-5", nome: "BOLSA TÉRMICA COM GEL", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0103-5", nome: "Cânula de Guedel nº 3", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0104-3", nome: "Cânula de Guedel nº 4", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0052-7", nome: "Cânula endotraqueal com balão nº 7,0", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0053-5", nome: "Cânula endotraqueal com balão nº 7,5", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0054-3", nome: "Cânula endotraqueal com balão nº 8,0", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0055-1", nome: "Cânula endotraqueal com balão nº 8,5", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0056-0", nome: "Cânula endotraqueal com balão nº 9,0", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0041-5", nome: "Captopril 25 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0117-3", nome: "Cateter intravenoso acesso central", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0113-0", nome: "Cateter intravenoso calibre 18G", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0115-7", nome: "Cateter intravenoso calibre 20G", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0116-5", nome: "Cateter intravenoso calibre 22G", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0114-9", nome: "Cateter intravenoso calibre 24G", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0069-0", nome: "Cateter para oxigenoterapia", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0253-1", nome: "Cinarizina 75 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0992-1", nome: "Clonazepam 0,25 mg - comprimido sublingual", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0111-2", nome: "Clonidina 0,1 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.55.0001-0", nome: "Clopidogrel 75 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.13.0023-7", nome: "Cloreto de potássio 10% - solução injetável - ampola com 10 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.10.0199-2", nome: "Clorexidina (digliconato) 1% - solução tópica - frasco com 100ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0100-1", nome: "Colagenase 0,6 U/g pomada - bisnaga com 30 g", unid: "BISNAGA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.1000-0", nome: "Colagenase+cloranfenicol 0,6U/g+0,01g/g pomada bisnaga 15g", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0036-9", nome: "Coletor de resíduos tóxicos", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1020-2", nome: "Compressa campo operatório (caixa com 50 unidades)", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0059-2", nome: "Compressa de gaze estéril 7,5 x 7,5 cm - pacote com 10 unidades", unid: "PACOTE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0075-6", nome: "Conjunto para traqueostomia com balão nº 7,0", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0076-4", nome: "Conjunto para traqueostomia com balão nº 7,5", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0080-2", nome: "Conjunto para traqueostomia com balão nº 8,0", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0071-3", nome: "Conjunto para traqueostomia com balão nº 8,5", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0078-0", nome: "Conjunto para traqueostomia com balão nº 9,0", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0072-1", nome: "Curativo adesivo formato circular", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0251-5", nome: "Deslanosídeo 0,2 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0121-1", nome: "Detergente enzimático - galão com 5 litros", unid: "GALÃO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.37.0002-0", nome: "Dexametasona (fosfato dissódico) 4 mg/ml - solução injetável - ampola", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.28.0001-2", nome: "Diazepam 10 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0001-2", nome: "Diclofenaco sódico 25 mg/ml - solução injetável - ampola com 3 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0010-1", nome: "Diclofenaco sódico 50 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0005-5", nome: "Dimenidrinato 3 mg/ml + piridoxina (cloridrato) 5 mg/ml + glicose 100 mg/ml + frutose 100 mg/ml - solução injetável - ampola com 10 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0108-6", nome: "Dimenidrinato 50 mg + piridoxina (cloridrato) 10 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0001-2", nome: "Dipirona 500 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0006-4", nome: "Dipirona 500 mg/ml - solução oral - frasco", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0009-6", nome: "Dispositivo para infusão endovenosa tipo scalp nº 23G", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0007-0", nome: "Dispositivo para infusão endovenosa tipo scalp nº 25G", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0155-1", nome: "Dobutamina (cloridrato) 12,5 mg/ml - solução injetável - ampola com 20 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0014-8", nome: "Dopamina (cloridrato) 5 mg/ml - solução injetável - ampola com 10 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0386-4", nome: "DRENO DE TÓRAX COM COLETOR", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0100-4", nome: "Eletrodo descartável", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0258-2", nome: "Enoxaparina sódica 100 mg/ml - solução injetável", unid: "SERINGA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0898-0", nome: "Epinefrina (adrenalina) 1 mg/ml - solução injetável - ampola com 1 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0143-2", nome: "Equipo de bomba de infusão", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0141-6", nome: "Equipo de bomba de infusão fotossensível", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0032-0", nome: "Equipo estéril macrogotas", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0033-9", nome: "Equipo microgotas com bureta", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0121-4", nome: "Escopolamina (butilbrometo) 20 mg/ml - solução injetável - ampola com 1 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0001-3", nome: "Escopolamina (butilbrometo) 4 mg/ml + dipirona 500 mg/ml - solução injetável - ampola com 5 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0998-3", nome: "Escopolamina (butilbrometo) 6,67 mg/ml + dipirona 333,4 mg/ml solução oral - frasco com 20 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1017-2", nome: "Escova endocervical", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0045-2", nome: "Esparadrapo 10 cm x 4,5 m", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1018-0", nome: "Espéculo (tamanho médio)", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1019-9", nome: "Espéculo (tamanho pequeno)", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0182-3", nome: "Extensor duas vias (multiplicador de acesso venoso ou conector duas vias)", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.56.0003-0", nome: "Fenitoína sódica 50 mg/ml - solução injetável - ampola com 5 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.56.0005-7", nome: "Fenobarbital sódico 100 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0900-5", nome: "Fenoterol (bromidrato) 5mg/ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.1001-9", nome: "Fentanil (citrato) 0,05 mg/ml - solução injetável - ampola com 5 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0089-4", nome: "Fio nylon monofilamento, tipo 3-0, agulha 1/2 cortante de 2,0 cm", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0120-3", nome: "Fio nylon monofilamento, tipo 4-0, agulha 1/2 cortante de 1,5 cm", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0092-4", nome: "Fio nylon monofilamento, tipo 4-0, agulha 3/8 cortante de 2,0 cm", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0085-1", nome: "Fio nylon monofilamento, tipo 5-0, agulha 3/8 cortante de 1,5 cm", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0081-9", nome: "Fio nylon monofilamento, tipo 6-0, agulha 1/2 cortante de 1,5 cm", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0041-0", nome: "Fita adesiva hospitalar cirúrgica 25 mm x 10 m", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0042-8", nome: "Fita adesiva hospitalar cirúrgica 50 mm x 10 m", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0056-3", nome: "Fita crepe hospitalar branca 19 mm x 50 m", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0050-4", nome: "Fita teste autoclave", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0379-1", nome: "Fixador estéril para cateteres", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0242-6", nome: "Flumazenil 0,1 mg/ml - solução injetável - ampola com 5 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0369-4", nome: "Fluxômetro para oxigênio", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0001-5", nome: "Frasco almotolia 250 ml", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0016-4", nome: "Furosemida 10 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0374-0", nome: "GARROTE DE LATEX OU BORRACHA", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0370-8", nome: "Garrote tipo fita", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.80.01.0007-0", nome: "Gás oxigênio medicinal - comprimido", unid: "METRO CÚBICO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0052-0", nome: "Gel para ECG - frasco", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0028-8", nome: "Gliconato de cálcio 10% - solução injetável - ampola com 10 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0025-3", nome: "Glicose 25% - solução injetável - ampola com 10 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0372-4", nome: "Gorro cirúrgico tipo Touca - Unidade", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.56.0009-0", nome: "Haloperidol 5 mg/ml - solução injetável - ampola com 1 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0102-7", nome: "Hidrocortisona (succinato sódico) - pó para solução injetável - frasco-ampola", unid: "FRASCO AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0902-1", nome: "Hidróxido de alumínio 230 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0064-9", nome: "Hipoclorito de sódio 1% - frasco com 1 litro", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0109-4", nome: "Insulina humana regular 100 UI/ml - solução injetável - frasco-ampola com 10 ml", unid: "FRASCO AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0200-7", nome: "Ipratrópio (brometo) 0,025 mg/ml - solução inalatória - frasco com 20 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.14.0001-0", nome: "Ipratrópio (brometo) 20 mcg/dose, solução pressurizada para inalação (aerossol), frasco acoplado com bocal - 200 doses", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0037-7", nome: "Isossorbida (dinitrato) 5 mg - comprimido sublingual", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.10.05.0037-7", nome: "LACRE SEGURANÇA NUMERADO - PACOTE (100 unidades)", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0010-0", nome: "Lâmina de bisturi nº 15", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0381-3", nome: "Lâmina de laboratório", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0362-7", nome: "LANCETA ESTÉRIL (23G)", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.40.0144-3", nome: "Lidocaína 20 mg/g - geleia - bisnaga com 30 g", unid: "BISNAGA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.40.0002-1", nome: "Lidocaína 20 mg/ml + epinefrina 0,005 mg/ml - solução injetável - frasco-ampola com 20 ml", unid: "FRASCO AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.40.0003-0", nome: "Lidocaína 20 mg/ml - solução injetável - frasco-ampola com 20 ml", unid: "FRASCO AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0243-4", nome: "Loratadina 10 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0179-3", nome: "Luva cirúrgica estéril nº 6,5 - Par", unid: "PAR" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0003-7", nome: "Luva cirúrgica estéril nº 7,0 - Par", unid: "PAR" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0072-0", nome: "Luva cirúrgica estéril nº 7,5 - Par", unid: "PAR" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0071-1", nome: "Luva cirúrgica estéril nº 8,0 - Par", unid: "PAR" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1005-9", nome: "LUVA DE VINIL DE TAMANHO M (USO MÉDICO).", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0298-6", nome: "LUVA LATEX M - Unidade", unid: "PAR" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0278-1", nome: "LUVA LATEX P - Unidade", unid: "PAR" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0291-9", nome: "LUVA LATEX XG - Unidade", unid: "PAR" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0389-9", nome: "LUVA NITRÍLICA SEM PÓ TAMANHO G", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0390-2", nome: "LUVA NITRÍLICA SEM PÓ TAMANHO GG", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1021-0", nome: "Luva nitrílica sem pó tamanho M (100 unidades)", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0387-2", nome: "LUVA NITRÍLICA SEM PÓ TAMANHO P", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1016-4", nome: "LUVA PARA PROCEDIMENTO (TAMANHO XG)", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0200-5", nome: "Luva para procedimento tamanho G - Caixa com 100 unidades", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0201-3", nome: "Luva para procedimento tamanho M - Caixa com 100 unidades", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0202-1", nome: "Luva para procedimento tamanho P - Caixa com 100 unidades", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0206-4", nome: "Luva para procedimento tamanho XP - Caixa com 100 unidades", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0388-0", nome: "LUVA VINÍLICA COM PÓ TAMANHO G", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0383-0", nome: "Luva vinílica com pó tamanho M", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0384-8", nome: "Luva vinílica com pó tamanho P", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0378-3", nome: "MANTA TÉRMICA PARA RESGATE", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0005-3", nome: "Máscara cirúrgica descartável - Caixa com 50 unidades", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1010-5", nome: "Máscara de tecido", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1001-6", nome: "Máscara laríngea descartável - tamanho 4", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1002-4", nome: "Máscara laríngea descartável - tamanho 5", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1008-3", nome: "MÁSCARA N95 - PFF2", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0002-4", nome: "Máscara para nebulização", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0015-3", nome: "Metoclopramida (cloridrato) 4 mg/ml - solução oral - frasco com 10 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0010-2", nome: "Metoclopramida (cloridrato) 5 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0351-1", nome: "Metoprolol (tartarato) 1 mg/ml - solução injetável - ampola com 5 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.57.0001-7", nome: "Midazolam 5 mg/ml - solução injetável - ampola com 3 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.40.0008-0", nome: "Morfina (sulfato) 10 mg/ml - solução injetável - ampola com 1 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0319-8", nome: "Naloxona (cloridrato) 0,4 mg/ml - solução injetável - ampola com 1 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0203-5", nome: "Nitroglicerina 5 mg/ml, solução injetável - ampola", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0066-5", nome: "Nitroprusseto de sódio 50 mg", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0030-0", nome: "Norepinefrina (noradrenalina) 2 mg/ml - solução injetável - ampola com 4 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.02.03.0005-3", nome: "Óculos para proteção individual - Unidade", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0996-4", nome: "Óleo vegetal - ácidos graxos essenciais - frasco com 200 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0897-1", nome: "Omeprazol 20 mg - cápsula", unid: "CÁPSULA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.10.0105-1", nome: "Omeprazol 40 mg - pó para solução injetável - frasco-ampola", unid: "FRASCO AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0170-5", nome: "Ondansetrona (cloridrato) 2 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0361-9", nome: "Pá desfibrilador adulto", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.04.0003-6", nome: "Papel para ECG - rolo", unid: "ROLO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0210-5", nome: "Paracetamol 200 mg/ml - solução oral - frasco com 15 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0211-3", nome: "Paracetamol 500 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0899-8", nome: "Paracetamol 750 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0504-7", nome: "Pera para ECG", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0382-1", nome: "Porta-lâminas", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0019-9", nome: "Prometazina (cloridrato) 25 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0122-2", nome: "Propafenona (Cloridrato) 300 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0072-0", nome: "Propé descartável - par", unid: "PAR" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0011-3", nome: "Propranolol (cloridrato) 40 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.22.0251-4", nome: "Ranitidina (cloridrato) 25 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.34.13.0002-3", nome: "Saco para hamper amarelo - caixa com 50 unidades", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.34.13.0005-8", nome: "Saco para hamper vermelho - caixa com 50 unidades", unid: "CAIXA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0993-0", nome: "Salbutamol (sulfato) 1 mg/ml - solução inalatória - flaconete de 2,5 ml", unid: "FLACONETE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.14.0002-9", nome: "Salbutamol (sulfato) 100 mcg/dose, solução pressurizada para inalação (aerossol), frasco acoplado com bocal/dispositivo inalatório - 200 doses", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0250-7", nome: "Salbutamol (sulfato) 5 mg/ml - solução inalatória - frasco com 10 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0035-5", nome: "Seringa estéril descartável com 1 ml", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0038-0", nome: "Seringa estéril descartável com 10 ml", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0037-1", nome: "Seringa estéril descartável com 20 ml", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0036-3", nome: "Seringa estéril descartável com 3 ml", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0039-8", nome: "Seringa estéril descartável com 5 ml", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.13.0237-0", nome: "Simeticona 75 mg/ml - emulsão oral - frasco", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.19.0031-5", nome: "Solução cloreto de sódio 0,9% - solução injetável - frasco com 100 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.19.0032-3", nome: "Solução cloreto de sódio 0,9% - solução injetável - frasco com 250 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.19.0030-7", nome: "Solução cloreto de sódio 0,9% - solução injetável - frasco com 500 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.19.0034-0", nome: "Solução glicose 5% - solução injetável - frasco com 100 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.19.0054-4", nome: "Solução glicose 5% - solução injetável - frasco com 250 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.19.0036-6", nome: "Solução glicose 5% - solução injetável - frasco com 500 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0003-7", nome: "Solução ringer com lactato de sódio - solução injetável - frasco com 500 ml", unid: "FRASCO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0019-3", nome: "Sonda nasogástrica nº 14", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0135-1", nome: "Sonda nasogástrica nº 18", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0101-7", nome: "Sonda uretral nº 08", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0102-5", nome: "Sonda uretral nº 10", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0103-3", nome: "Sonda uretral nº 12", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0243-9", nome: "Sonda uretral nº 14", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.0350-8", nome: "Sonda uretral nº 16", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1003-2", nome: "Sonda uretral nº 18", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0999-1", nome: "Sulfadiazina de prata 10mg/g, creme, bisnaga com 100 g.", unid: "BISNAGA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0123-0", nome: "Sulfato de magnésio 10% - solução injetável - ampola com 10 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0133-8", nome: "Sulfato de magnésio 50% - solução injetável - ampola com 10 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.25.0120-1", nome: "Suxametônio (cloreto) 100 mg - pó para solução injetável", unid: "FRASCO AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.25.0126-0", nome: "Tenoxicam 20 mg - pó para solução injetável - frasco-ampola", unid: "FRASCO AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0365-1", nome: "Termômetro clínico", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0995-6", nome: "Teste imunológico D-DÍMERO", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0991-3", nome: "Teste imunológico de marcadores cardíacos (troponina, mioglobina e CK-MB)", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0994-8", nome: "Teste imunológico PRO BNP", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.78.01.0998-0", nome: "Teste rápido de dengue", unid: "TESTE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.25.0001-9", nome: "Tiocolchicosídeo 2 mg/ml - solução injetável - ampola com 2 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.25.0127-9", nome: "Tiocolchicosídeo 4 mg - comprimido", unid: "COMPRIMIDO" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0101-0", nome: "Tira reagente de glicemia", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.02.1006-7", nome: "Torneira de três vias", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.79.01.0113-3", nome: "Tramadol (cloridrato) 50 mg/ml - solução injetável - ampola com 1 ml", unid: "AMPOLA" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.09.0241-4", nome: "TUBO COLETOR COM CITRATO", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0363-5", nome: "TUBO PLASTICO DESCARTÁVEL (4 ML)", unid: "UNIDADE" },
    { almox: "Almoxarifado do Serviço Médico", cod: "03.67.01.0371-6", nome: "Válvula tipo Bi para oxigênio", unid: "UNIDADE" },
    
    // GRÁFICOS
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0029-9 ", nome: "ANEL DE SEGURANCA 47X175  - Müller Martini 3006 - 00311122 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0043-4 ", nome: "ENGRENAGEM Z37 - Müller Martini 3006 - 300139454 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0063-9 ", nome: "FACA - Müller Martini 321 -  89005383 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0064-7 ", nome: "FACA - Müller Martini 321 -  89005393 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0066-3 ", nome: "FACA - Müller Martini 321 - 89005352 (GRAMPEADEIRA) ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0065-5 ", nome: "FACA - Müller Martini 321 - 89005403 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0062-0 ", nome: "MOLA DE LAMINA BD10/08X40  - Müller Martini 321 - 0346251 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0061-2 ", nome: "MOLA DE LAMINA BD10/08X40  - Müller Martini 321 - 0346252 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0060-4 ", nome: "MOLA DE LAMINA BD10/08X40  - Müller Martini 321 - 0346253 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0025-6 ", nome: "ROLAMENTO DE ESFERAS 6005-2RS  - Müller Martini 3006 - 00381078 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0023-0 ", nome: "ROLAMENTO DE ESFERAS 6201-2RS - Müller Martini 3006 - 00381144 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0080-9 ", nome: "Válvula de Cilindro - HEIDELBERG - SM 74 - 61.184.1136 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0051-5 ", nome: "CORREIA DENTADA 19T10/500ENDLOPC - Müller Martini 321 - 300645984" , unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.61.53.5069-3 ", nome: "056109119A CORREIA DENTADA ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0176-9 ", nome: "ABRAÇADEIRA C/ PARAFUSO REGULAGEM 1/2POL / 03.97.21.9255-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.01.9843-7 ", nome: "ABRAÇADEIRA NYLON 150MM X 3,5MM (pacote c/ 100 unidades cada) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.01.9754-6 ", nome: "ABRAÇADEIRA NYLON 300X5,8MM PACOTE COM (200 UNIDADES) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0001-0 ", nome: "ABRAÇADEIRA REGULAVEL 1/4POL / 03.45.02.9042-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0178-5 ", nome: "ABRAÇADEIRA ZA3218610 GUILHOTINA 137 / 03.97.15.9171-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.12.9092-2 ", nome: "ACABAMENTO ALAVANCA DO MOLHADOR ROLAND ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0179-3 ", nome: "ACESSÓRIO DA BASE MARTINI 321 / 03.97.17.9714-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0157-8 ", nome: "ACIONADOR 231-758-BG-01 STHAL / 03.81.21.9253-5  ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0180-7 ", nome: "ACIONADOR 881.0317.4 MARTINI 321 / 03.97.17.9618-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0181-5 ", nome: "ACIONADOR T20/14/3X31MM 0210.0746.4 MAR-TINI 3006 / 03.97.17.9333-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0168-6 ", nome: "ACOPLADOR 1 (ARTICULAÇÃO ANGULAR M8/M8L) - 390.713 MULLER MARTINI 3006 - COLEIRO ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0169-4 ", nome: "ACOPLADOR 2 ( ARTICULAÇÃO ANGULAR M8/M8) - 390.703 MULLER MARTINI 3006-COLEIRO ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0151-1 ", nome: "Acoplamento - STAHL KD 78/4 - ZD.235-350-01-00 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0183-1 ", nome: "ACOPLAMENTO 005801485 SPEEDMASTER 102 / 03.97.11.9842-2 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.03.9690-5 ", nome: "ACOPLAMENTO 5035998 GUILHOTINA WOHLENBERG ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0184-0 ", nome: "ACOPLAMENTO COMPRESSOR ROLAND / 03.97.11.9341-2 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.12.9144-9 ", nome: "ACOPLAMENTO DENTADO (80.21B13-0378) ROLAND 700 -  ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0197-0 ", nome: "ACOPLAMENTO GR14 S(STHAL) (DOBRADEIRA) ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0185-8 ", nome: "ACOPLAMENTO GUILHOTINA 421296692. 1/0PERFECTA / 03.97.15.9309-7 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0186-6 ", nome: "ACOPLAMENTO MOTOR SAIDA MESA ROLAND / 03.97.12.9096-5 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0187-4 ", nome: "ACOPLAMENTO MV 103180 W D / 03.97.17.9544-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0188-2 ", nome: "ACOPLAMENTO ZA3013573 GUILHOTINA 137 / 03.97.15.9182-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0190-4 ", nome: "ADAPTADOR BE3 00511621 MARTINI 3006 / 03.97.18.9156-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0191-2 ", nome: "ADAPTADOR PARA ENTRADA DE AR MARTINI 321 / 03.97.17.9483-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0192-0 ", nome: "ADAPTADOR ROSQ 9396 AD 1/4X1/4 NPT / 03.97.21.9367-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0193-9 ", nome: "ADAPTADOR ROSQ 9398 AD 1/2X1/2 NPT / 03.97.21.9368-8 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.21.9032-0 ", nome: "ADESIVO BRANCO PARA ENCADERNAÇÃO MANUAL (Embalagem 10/50 KG) ", unid: "QUILOGRAMA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.21.9094-0 ", nome: "ADESIVO GRANULADO ENCADERNAÇÃO HOT-MELT (25 KG) ", unid: "QUILOGRAMA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.27.9079-3 ", nome: "ADESIVO PARA LATERAL DE LIVROS (Tipo Bigode) (COM 15 KG CADA) ", unid: "QUILOGRAMA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.17.9032-3 ", nome: "AGUA DESMINERALIZADA SPEEDMASTER (GALÕES C/ 5, 20 E 50 LITROS) ", unid: "LITRO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0304-0 ", nome: "AGULHA - ASTRONIC 180 (FEE-269-69278) ", unid: "UNIDADE " },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0158-6 ", nome: "AGULHA MAQUINA COSTURA INDUSTRIAL Nº 18 / 03.81.21.9255-1 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0159-4 ", nome: "AGULHA MAQUINA COSTURA INDUSTRIAL Nº 19 / 03.81.21.9256-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0160-8 ", nome: "AGULHA MAQUINA COSTURA INDUSTRIAL Nº 21 (EMB 10 UND) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0161-6 ", nome: "AGULHA MAQUINA COSTURA INDUSTRIAL Nº 23 / 03.81.21.9267-5 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.21.9001-0 ", nome: "AGULHA Nº 12 COM FURO MAQ. COSTURA ASTR-ONIC (PCT 10 UND) ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0197-1 ", nome: "AGULHA RD 1,5X12 0291.2111.4 MARTINI 321 / 03.97.17.9497-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0199-8 ", nome: "ALAVANCA 0210.0416.4 MARTINI 3006 / 03.97.17.9361-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0200-5 ", nome: "ALAVANCA 0210.0699.3 MARTINI 3006 / 03.97.17.9255-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0201-3 ", nome: "ALAVANCA 0210.0804.3 MARTINI 3006 / 03.97.17.9279-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0202-1 ", nome: "ALAVANCA 022.0325 MARTINI 321 / 03.97.18.9204-3 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0203-0 ", nome: "ALAVANCA 0890.1415.2 MARTINI 321 / 03.97.17.9923-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0204-8 ", nome: "ALAVANCA 221-998-BG-01 STHAL 78 / 03.97.17.9598-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0207-2 ", nome: "ALAVANCA 881.0011.4 MARTINI 321 / 03.97.17.9609-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0208-0 ", nome: "ALAVANCA ACIONAMENTO STHAL R 800-71 / 03.97.17.9438-6 ", unid: "JOGO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0209-9 ", nome: "ALAVANCA ACIONAMENTO STHAL R 800-72 / 03.97.17.9439-4 ", unid: "JOGO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.01.9612-4 ", nome: "ALAVANCA APERTO M8X32 ZD.222-608-01-00 DOBRADEIRA STHAL KD 56-78  ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0212-9 ", nome: "ALAVANCA COM ROLETE 306.1134.4 MARTINI321 / 03.97.17.9646-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0243-7 ", nome: "Alavanca de Garfo SM74 (M2.011.126) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0244-5 ", nome: "Alavanca de Rolo SM74 (M2.011.120) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0213-7 ", nome: "ALAVANCA DISTRIBUIÇAO M2010121 SPEEDMASTER / 03.97.11.9487-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.12.9093-0 ", nome: "ALAVANCA DO MOLHADOR ROLAND ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0215-3 ", nome: "ALAVANCA FL 040/11.9 881.0006.4 MARTINI321 / 03.97.17.9608-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0216-1 ", nome: "ALAVANCA FL30/6X152 0227.0283.4 MARTINI3006 / 03.97.17.9262-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0217-0 ", nome: "ALAVANCA FL30/6X227MM 0227.0282.4 MARTI-NI 3006 / 03.97.17.9325-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0220-0 ", nome: "ALAVANCA MARTINI 12X40MM 0022.034.7 / 03.97.18.9108-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0221-8 ", nome: "ALAVANCA MARTINI 6X10MM 0022.031.1 / 03.97.18.9111-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0222-6 ", nome: "ALAVANCA MARTINI 6X20MM 0022.031.4 / 03.97.18.9112-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0223-4 ", nome: "ALAVANCA MARTINI 6X30MM 0022.031.5 / 03.97.18.9110-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0224-2 ", nome: "ALAVANCA MARTINI 8X10MM 0022.032.2 / 03.97.18.9113-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0225-0 ", nome: "ALAVANCA MV 891130 W D / 03.97.17.9859-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0226-9 ", nome: "ALAVANCA N 200025 W D / 03.97.17.9858-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.17.9021-8 ", nome: "ALCOOL ISOPROPILICO - ipa (Galao 20 Litros) ", unid: "LITRO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.03.9746-4 ", nome: "ALIMENTAÇÃO DE PASSAGEM COD.00.580.4753 ", unid: "UNIDADE " },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.03.9455-4 ", nome: "ALIMENTAÇAO SCHMIERZUFUEHRUNG KOM ZD.225-865-BG01 DOBRADEIRA STAHL KD 56-78 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0162-4 ", nome: "ALONGADOR METÁLICO 10MM COM  PARAFUSOENCADERNAÇÃO / 03.81.21.9145-8 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0163-2 ", nome: "ALONGADOR METÁLICO 15MM COM  PARAFUSOENCADERNAÇÃO / 03.81.21.9146-6 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0164-0 ", nome: "ALONGADOR METÁLICO 18MM COM  PARAFUSOENCADERNAÇÃO / 03.81.21.9147-4 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0165-9 ", nome: "ALONGADOR METALICO 20MM COM PARAFUSOENCADERNAÇAO / 03.81.21.9181-4 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0166-7 ", nome: "ALONGADOR METÁLICO 40MM COM  PARAFUSOENCADERNAÇÃO / 03.81.21.9148-2 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0167-5 ", nome: "ALONGADOR METALICO 50MM COM PARAFUSOENCADERNAÇAO / 03.81.21.9182-2 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.01.9397-4 ", nome: "AMORTECEDOR  50P2 TAMPA CTP SCREEN Cód. 100111174V00  ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.01.9390-7 ", nome: "AMORTECEDOR 40P4 TAMPA CTP SCREEN Cód. 100111176V00  ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0228-5 ", nome: "AMORTECEDOR A GAS 005804482 SPEEDMASTER74 / 03.97.11.9988-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.12.9171-6 ", nome: "AMORTECEDOR A GAS 80.94K40-9523 ROLAND 700 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0229-3 ", nome: "AMORTECEDOR BORRACHA 888.0240.4 MARTINI321 / 03.97.17.9091-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.01.9360-5 ", nome: "AMORTECEDOR DE MESA PATH - CTP SCREEN (100014330V00) ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0097-3 ", nome: "Anel  Bucha - HEIDELBERG - SM 74 - 91.010.312 ", unid: "UNIDADE " },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0230-7 ", nome: "ANEL 005201973 SPEEDMASTER / 03.97.11.9653-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0231-5 ", nome: "ANEL 200-104-03-00 STHAL K 78 / 03.97.17.9978-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0232-3 ", nome: "ANEL 200-104-09-00 STHAL K 78 / 03.97.17.9994-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0233-1 ", nome: "ANEL 200-104-16-00 STHAL K 78 / 03.97.17.9979-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0234-0 ", nome: "ANEL 200-218-09-00 STHAL K 78 / 03.97.18.9045-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0235-8 ", nome: "ANEL 200-404-02-00 STHAL K 78 / 03.97.17.9836-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0236-6 ", nome: "ANEL 231467 GUILHOTINA 137 / 03.97.15.9041-1 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.2456-4 ", nome: "ANEL 80.05F30-6097 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0238-2 ", nome: "ANEL BORRACHA 80.90R40-6001 ROLAND 700 / 03.97.12.9106-6 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0239-0 ", nome: "ANEL BORRACHA 80.90R40-6002 ROLAND 700 / 03.97.12.9107-4 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0240-4 ", nome: "ANEL BORRACHA 80.90R40-6003 ROLAND 700 / 03.97.12.9108-2 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0241-2 ", nome: "ANEL BORRACHA 80.90R40-6004 ROLAND 700 / 03.97.12.9109-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0242-0 ", nome: "ANEL BORRACHA 80.90R40-6005 ROLAND 700 / 03.97.12.9110-4 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0243-9 ", nome: "ANEL BORRACHA 80.90R40-6006 ROLAND 700 / 03.97.12.9111-2 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0244-7 ", nome: "ANEL BORRACHA 80.90R40-6007 ROLAND 700 / 03.97.12.9112-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0245-5 ", nome: "ANEL DE AJUSTE 231469 GUILHOTINA 137 / 03.97.15.9043-8 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.03.9570-4 ", nome: "ANEL DE BORRACHA  COD. 253938  ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.05.9138-4 ", nome: "ANEL DE BORRACHA COD. 251068 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0031-0 ", nome: "ANEL DE SEGURANCA 25X12 - Müller Martini 3006 - 00311016 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0026-4 ", nome: "ANEL DE SEGURANCA 32X12 - Müller Martini 3006 - 00311115 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0246-3 ", nome: "ANEL ELÁSTICO DIN 137A8 O-90R0409-40 RO-LAND / 03.97.11.9516-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0098-1 ", nome: "Anel exterior - HEIDELBERG - SM 74 - 00.580.2333 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0248-0 ", nome: "ANEL FOLGA 20X28MMX10MICRA ROLAND / 03.97.11.9004-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.12.9080-9 ", nome: "ANEL FURO 20X1,2MM ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0250-1 ", nome: "ANEL L-99Z4622-95 ROLAND / 03.97.11.9553-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0252-8 ", nome: "ANEL MOTOR / 03.97.21.9260-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0039-6 ", nome: "ANEL NILOS 6004JV - Müller Martini 3006 - 00351759 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0253-6 ", nome: "ANEL O RING 16X03X22,2MM SPEEDMASTER / 03.97.11.9480-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0254-4 ", nome: "ANEL O RING 20MM / 03.97.21.9410-2 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.2455-6 ", nome: "ANEL O-RING 22,2 - 3 72NBR/872  80.93040-1017 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0255-2 ", nome: "ANEL O-RING 40,87X3,53MM / 03.97.07.9084-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0256-0 ", nome: "ANEL O`RING ZA3264089 GUILHOTINA 137 / 03.97.15.9175-2 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0257-9 ", nome: "ANEL O`RING ZA3264097 GUILHOTINA 137 / 03.97.15.9176-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0258-7 ", nome: "ANEL O`RING ZA3264104 GUILHOTINA 137 / 03.97.15.9173-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0259-5 ", nome: "ANEL O`RING ZA3264105 GUILHOTINA 137 / 03.97.15.9174-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0260-9 ", nome: "ANEL O`RING ZA3264106 GUILHOTINA 137 / 03.97.15.9166-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0261-7 ", nome: "ANEL R25/3,5X3,5MM 3000.4654.4 MARTINI3006 / 03.97.17.9365-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0262-5 ", nome: "ANEL RETENÇAO 005100104 SPEEDMASTER / 03.97.11.9475-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0263-3 ", nome: "ANEL RETENÇÃO 04MM PARA EIXO / 03.97.21.9194-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0264-1 ", nome: "ANEL RETENÇÃO 08MM PARA FURO / 03.97.21.9201-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0265-0 ", nome: "ANEL RETENÇÃO 10MM PARA FURO / 03.97.21.9202-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0266-8 ", nome: "ANEL RETENÇÃO 12MM PARA FURO / Código antigo:  ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0267-6 ", nome: "ANEL RETENÇÃO 14MM PARA FURO / 03.97.21.9204-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0268-4 ", nome: "ANEL RETENÇÃO 16MM PARA FURO / 03.97.21.9205-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0269-2 ", nome: "ANEL RETENÇÃO 18MM PARA EIXO / 03.97.21.9092-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0270-6 ", nome: "ANEL RETENÇÃO 20MM EIXO / 03.97.15.9039-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0271-4 ", nome: "ANEL RETENÇÃO 3,2MM PARA EIXO MARTINI3006 / 03.97.17.9243-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0264-7 ", nome: "ANEL RETENÇÃO 85MM PARA FURO / 03.98.11.9005-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0272-2 ", nome: "ANEL RETENÇÃO EIXO 22MM / 03.97.21.9432-3 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0273-0 ", nome: "ANEL RETENÇÃO EIXO 24MM / 03.97.21.9433-1 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0274-9 ", nome: "ANEL RETENÇÃO EIXO 25MM / 03.97.21.9434-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0275-7 ", nome: "ANEL RETENÇAO RS 10MM PARA EIXO / 03.97.21.9247-9 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0276-5 ", nome: "ANEL RETENÇAO RS 12MM PARA EIXO / 03.97.21.9248-7 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0277-3 ", nome: "ANEL RETENÇAO RS 15MM PARA EIXO / 03.97.21.9249-5 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0278-1 ", nome: "ANEL RETENÇAO RS 4MM PARA EIXO / 03.97.21.9244-4 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0280-3 ", nome: "ANEL RETENÇAO RS 8MM PARA EIXO / 03.97.21.9246-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0281-1 ", nome: "ANEL TEFLON ZA3205036 GUILHOTINA 137 / 03.97.15.9169-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.05.9139-2 ", nome: "ANEL TRAVA COD. 251399 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0168-3 ", nome: "ANEL VEDAÇÃO VÁLVULA REUBLI / 03.81.33.9007-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0282-0 ", nome: "ÂNGULO PINÇA 12487 WOHLENBERG / 03.97.15.9102-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0283-8 ", nome: "ANGULO PINÇA 12845 WOHLENBERG / 03.97.15.9101-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.21.9098-2 ", nome: "ANTIADERENTE USO MESA GUILHOTINA ", unid: "FRASCO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.25.09.0590-9 ", nome: "ANTICORROSIVO EM SPRAY ", unid: "FRASCO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.2509-9 ", nome: "APLICADOR DE FITAS TIPO MANUAL (MATERIAL CABO ALUMINIO APLICADOR FITA 30MMA 80MM COM E SEM REFORÇO DE NYLON) ", unid: "UNIDADE " },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0284-6 ", nome: "APOIO 223-574-BG-01 STHAL K 78 / Código antigo:  ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0285-4 ", nome: "APOIO 223-574-BG-02 STHAL K 78 / 03.97.18.9015-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0286-2 ", nome: "APOIO C358192003 PINÇA SPEEDMASTER 102 / 03.97.11.9880-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0287-0 ", nome: "APOIO DE PAPEL MV 561420 W D / 03.97.17.9862-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0288-9 ", nome: "APOIO DE PINÇA C4313107 SPEEDMASTER 102 / 03.97.11.9749-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0289-7 ", nome: "APOIO LA M2010041 SPEEDMASTER 74 / 03.97.11.9982-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0290-0 ", nome: "APOIO LC M2010042 SPEEDMASTER 74 / 03.97.11.9983-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0291-9 ", nome: "APOIO MV 521820 W D / 03.97.17.9552-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0292-7 ", nome: "APOIO MV 562320 W D / 03.97.17.9550-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0019-1 ", nome: "AQUECEDOR 230V/200W - Müller Martini 3006 - 00506685 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0254-2 ", nome: "AQUECEDOR INDUTIVO DE ROLAMENTO ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0002-9 ", nome: "ARAME AÇO 0,5MM / 03.45.07.9002-1 ", unid: "METRO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0003-7 ", nome: "ARAME AÇO 0,75MM / 03.45.07.9004-8 ", unid: "METRO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0004-5 ", nome: "ARAME AÇO 1,00MM / 03.45.07.9012-9 ", unid: "METRO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0005-3 ", nome: "ARAME AÇO 1,50MM / 03.45.07.9017-0 ", unid: "METRO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0006-1 ", nome: "ARAME AÇO 2,0MM / 03.45.07.9018-8 ", unid: "METRO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0007-0 ", nome: "ARAME AÇO 3,00MM / 03.45.07.9019-6 ", unid: "METRO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0008-8 ", nome: "ARAME AÇO BITOLA 10 / 03.45.35.9001-5 ", unid: "QUILOGRAMA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0169-1 ", nome: "ARAME GALVANIZADO COBREADO 20(BOB. C/2,5KG APROXIMADA) / 03.81.21.9119-9 ", unid: "ROLO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0170-5 ", nome: "ARAME GALVANIZADO COBREADO 22(BOB. C/2,5KG APROXIMADA) / 03.81.21.9102-4 ", unid: "ROLO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.21.9230-6 ", nome: "ARAME GALVANIZADO Nº 25 DIN ", unid: "ROLO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.58.53.0029-4 ", nome: "ARAME SOLDA AÇO CARBONO 0,80MMX300MM ", unid: "QUILOGRAMA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.58.53.0028-6 ", nome: "ARAME SOLDA AÇO INOXIDAVEL 0,80MMX300MM ", unid: "QUILOGRAMA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.58.53.0026-0 ", nome: "ARAME SOLDA ALUMINIO 1,0MMX300MM ", unid: "QUILOGRAMA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0175-9 ", nome: "ARANHA (CHAPA DE SEGURANÇA 15-ISO2982) 310.923 - MULLER MARTINI 3006 - GRAMPEADEIRA ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0294-3 ", nome: "ARGOLA O-92F0104-50 ROLAND / 03.97.11.9511-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0295-1 ", nome: "ARRASTADOR 021060324 MARTINI 3006 AZUL / Código antigo:  ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0296-0 ", nome: "ARRASTADOR 3006.5671.3 MARTINI(3000.7617.4) / 03.97.17.9527-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.2486-6 ", nome: "ARRUELA 6. MARCA HEIDELBERG COD.00.510.0004 ", unid: "UNIDADE " },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.03.9748-0 ", nome: "ARRUELA DE AJUSTE  MARCA HEIDELBERG COD. 00.520.1648 ", unid: "UNIDADE " },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0022-1 ", nome: "ARRUELA DE APOIO S12X18X12 - Müller Martini 3006 - 00220402 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0027-2 ", nome: "ARRUELA DE APOIO S25X35X2 - Müller Martini 3006 - 00220410 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.2458-0 ", nome: "ARRUELA DE SEGURANÇA 80.90R40-0164 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.2409-2 ", nome: "ARRUELA DE SEGURANÇA DO TRANFERIDOR 80.90R40-0168 MARCA / MODELO MANROLAND / IMPORTADO ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0227-5 ", nome: "Arruela de segurança VS6 RZK (80.90R40-0161) ", unid: "UNIDADE " },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0143-0 ", nome: "Arruela VS5 RZK (80.90R40-0160) ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0176-7 ", nome: "ARRUELA/ENCOSTO (ANEL R25/35X35) 3000.4654.4 - MULLER MARTINI 3006 - GRAMPEADEIRA ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0317-6 ", nome: "ARTICULAÇÃO ANGULAR M8/M8 00390703MARTINI 3006 / 03.97.18.9139-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0318-4 ", nome: "ARTICULAÇÃO EM RÓTULA M5 STHAL / 03.97.17.9101-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0319-2 ", nome: "ARTICULAÇÃO ESFERICA SFG10 0039.0744MARTINI 3006 / 03.97.17.9237-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0321-4 ", nome: "ARTICULAÇÃO ESFÉRICA SFLG10 0039.0754MARTINI 3006 / 03.97.17.9169-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0322-2 ", nome: "ARTICULAÇÃO ESFERICA SFLG8 0039.0753MARTINI 3006 / 03.97.17.9233-2 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0323-0 ", nome: "ARTICULAÇÃO ESFERICA SMG10 0039.0724MARTINI 3006 / 03.97.17.9244-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0324-9 ", nome: "ARTICULAÇÃO ESFERICA SMG8 0039.0723 MAR-TINI 3006 / 03.97.17.9232-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0325-7 ", nome: "ARTICULAÇÃO ESFÉRICA SMLG10 0039.0734MARTINI 3006 / 03.97.17.9168-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0326-5 ", nome: "ARTICULAÇÃO ESFERICA SMLG8 0039.0733MARTINI 3006 / 03.97.17.9231-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0327-3 ", nome: "ASPIRADOR C402800902 SPEEDMASTER / 03.97.11.9728-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0328-1 ", nome: "ASPIRADOR DE ARRASTE MV02632601SPEEDMASTER / 03.97.11.9387-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.2315-0 ", nome: "ASPIRADOR FH 1017985/01 STHALL ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0332-0 ", nome: "ASPIRADOR S-99Z6962-95 ROLAND / 03.97.11.9581-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0333-8 ", nome: "ASPIRADOR SEPARADOR Nº 6 ROLAND / 03.97.11.9125-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0052-0 ", nome: "BARBANTE ALGODÃO / 03.37.05.9001-8 ", unid: "ROLO" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.01.9116-5 ", nome: "BARRA  DE PINCA 1.22 MANUAL ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0335-4 ", nome: "BARRA 0894.1698.4 MARTINI 3006 / 03.97.17.9306-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0336-2 ", nome: "BARRA ALUMINIO FL20/8X260MM 3000.7476.4MARTINI 3006 / 03.97.17.9318-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0337-0 ", nome: "BARRA ANTI-ESTÁTICA MAQ. PLASTIFICADORA / 03.97.17.9456-4 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0338-9 ", nome: "BARRA APERTO SPEEDMASTER 102 / 03.97.11.9991-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.12.9165-1 ", nome: "BARRA DA MOLA DE PRESSAO CPL MV.023.913/01HEIDELBERG SM 74 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0140-6 ", nome: "Barra de apoio RZK (80.05A30-4014) ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.12.9142-2 ", nome: "BARRA DE TORÇÃO 20391386/0240 ROLAND 700 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0339-7 ", nome: "BARRA DE TRAÇÃO RD10X193 300614304MARTINI 3006 / 03.97.18.9165-9 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0050-7 ", nome: "BARRA FL50/40X80 (300610683) MM COLEIRO ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0340-0 ", nome: "BARRA M2013007F04 SPEEDMASTER 74 / 03.97.11.9888-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.12.9149-0 ", nome: "BARRA MOLA DE PRESSAO SM 74 HEIDELBERG M2.005.023 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0341-9 ", nome: "BARRA PLASTICA GUILHOTINA ZA3259430 POLAR / 03.97.15.9069-1 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0342-7 ", nome: "BARRA SUCÇÃO 0210.0446.3 MARTINI 3006 / 03.97.17.9352-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0343-5 ", nome: "BARRA SUCÇÃO 0210.0447.3 MARTINI 3006 / 03.97.17.9353-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0344-3 ", nome: "BARRA SUCÇÃO 0210.0501.3 MARTINI 3006 / 03.97.17.9299-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0345-1 ", nome: "BARREIRA DE LUZ ORR 2NA100I2 (00525111) MM COLEIRO ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0346-0 ", nome: "BARREIRA ÓTICA 5317 WOHLENBERG / 03.97.15.9103-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0187-2 ", nome: "BASE (APOIO PARAR BEST.AUS) 3002.1110.2 MULLER MARTINI 321/0400 (GRAMPEADEIRA) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0190-2 ", nome: "BASE (APOIO PARAR BEST.AUS)3002.6111.2 MULLER MARTINI 321/0400 (GRAMPEADEIRA) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0188-0 ", nome: "BASE (CARRO 60X130X242) MULLER MARTINI (GRAMPEADEIRA) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0347-8 ", nome: "BASE 3006.1318-1 MARTINI 3006 / Código antigo:  ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0348-6 ", nome: "BASE 6U203 Nº 39 ROLAND / 03.97.11.9434-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0349-4 ", nome: "BASE COMANDO 5171 WOHLENBERG / 03.97.15.9104-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0350-8 ", nome: "BASE FIXAÇAO PÉ MARTINI 321 / 03.97.17.9844-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0351-6 ", nome: "BASE PINÇA 3-17C1673-13 ROLAND / 03.97.11.9501-6 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0352-4 ", nome: "BASE PINÇA O-05A4749-90 ROLAND / 03.97.11.9503-2 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.11.9007-5 ", nome: "BASE PROVA HOSTAPHAN 66X96CM LEILAO 2010 ", unid: "FOLHA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0353-2 ", nome: "BATENTE 0210.0587.3 MARTINI 3006 / 03.97.17.9359-2 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0354-0 ", nome: "BATENTE 3609.1377.4 MARTINI 3006 / 03.97.17.9340-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0355-9 ", nome: "BATENTE BORRACHA BASE COMPRESSOR STHAL / 03.97.17.9139-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0356-7 ", nome: "BATENTE C/PARAFUSO 5010189 WOHLENBERG / 03.97.15.9059-4 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0357-5 ", nome: "BATENTE LIMITADOR 306.1188.3 MARTINI 321 / 03.97.17.9641-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0358-3 ", nome: "BATENTE O-11I2437-3O ROLAND / 03.97.11.9593-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0359-1 ", nome: "BATENTE PLÁSTICO 7004710 WOHLENBERG / 03.97.15.9060-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0172-1 ", nome: "BATERIA 3,0V 01243 MAQUINA COSTURAASTRONIC / 03.81.21.9282-9 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0173-0 ", nome: "BATERIA 3,6V 5AH MAQUINA COSTURAASTRONIC / 03.81.21.9028-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.49.29.0287-1 ", nome: "BATERIA TRACIONÁRIA 24 V ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0200-3 ", nome: "BÊDAME DE 3 / 4 POLEGADAS MODELO HARDSTEEL  ESAB 4602253BM0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0360-5 ", nome: "BICO COLEIRO MARTINI 3006 / 03.97.17.9528-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.2432-7 ", nome: "Bico de engraxadeira R708 (80.94N40-0363) ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.2433-5 ", nome: "Bico de engraxadeira SK10M10 R708 (80.94N40-0364) ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0361-3 ", nome: "BICO REDUÇÃO LATÃO 45 GRAUS / 03.97.21.9164-2 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.55.01.9135-9 ", nome: "BITS DE AÇO RAPIDO 1/2 X 6 POLEGADAS (DORMER) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.17.9005-6 ", nome: "BLANQUETA 4L 627X772MM SPEEDMASTER 74 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.17.9001-3 ", nome: "BLANQUETA 4L 865X1050MM ROLAND ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.81.17.9055-2 ", nome: "BLANQUETA 4L 910X1060X1,95MM ROLAND 700 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0144-9 ", nome: "Blanqueta Super Press 1025x748x0,65 - MANROLAND RZK - 8110T133012 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.03.9681-6 ", nome: "BLOCO 5033892 GUILHOTINA WOHLENBERG ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0362-1 ", nome: "BLOCO DE CONTATO MV051074 SPEEDMASTER / 03.97.11.9913-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0363-0 ", nome: "BLOCO DE CONTATO MV051080 SPEEDMASTER / 03.97.11.9914-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.01.9480-6 ", nome: "BLOCO ZD.223-738-01-00 DOBRADEIRA STHAL KD 56-78  ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.52.40.0440-7 ", nome: "BOBINA IGNIÇÃO 12 VOLTS ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0366-4 ", nome: "BOBINA MAGNÉTICA N-37X6092-41 ROLAND / 03.97.11.9598-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0367-2 ", nome: "BOCAL LAMPADA SINALIZAÇÃO 0051.0305 MAR-TINI 3006 / 03.97.17.9524-2 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0368-0 ", nome: "BOLSA 3006.1319-0 MARTINI 3006 / 03.97.18.9023-7 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0369-9 ", nome: "BOMBA CIRCULAÇÃO ÁGUA 237.M.4105.56ROLAND / 03.97.11.9668-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0370-2 ", nome: "BOMBA CIRCULAÇÃO SPEEDMASTER / 03.97.11.9138-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0223-2 ", nome: "BOMBA DE AR CABEÇOTE  - CTP SCREEN (100082535V01) ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0136-8 ", nome: "Bomba dosadora de oleo bielomatic R708 (8A.93F90-1061) ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0371-0 ", nome: "BORBOLETA FIXAÇÃO 5/32POL. / 03.97.21.9031-0 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0177-5 ", nome: "BOTÃO (ELEMENTO DE COMANDO M22-PV/KC1 - 512-351 MULLER MARTINI 3006 - GRAMPEADEIRA ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0372-9 ", nome: "BOTAO AZUL MV051054 SPEEDMASTER / 03.97.11.9908-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.07.0213-5 ", nome: "BOTÃO DE IMPACTO  00.780.2316 CÓD.MV.051.081 ", unid: "UNIDADE " },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0374-5 ", nome: "BOTÃO GIRATORIO 00580444203 SPEEDMASTER / 03.97.11.9439-7 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.03.9696-4 ", nome: "BOTÃO GIRATORIO 7004818 GUILHOTINA  WOHLENBERG ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0375-3 ", nome: "BOTÃO M22PV-EX 00511504 00512245 MARTINI 3006 / 03.97.18.9158-6 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0376-1 ", nome: "BOTAO MV051081 SPEEDMASTER 74 / 03.97.11.9895-3 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0377-0 ", nome: "BOTAO MV051084 SPEEDMASTER / 03.97.11.9915-1 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.97.05.9479-0 ", nome: "BOTÃO PULSADOR ELENCO LEILAO 2011 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0378-8 ", nome: "BOTAO REGULADOR 544.02V/400W 3001.6801.4MARTINI 3006 / 03.97.17.9468-8 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.13.18.0001-1 ", nome: "BOX P/ CD FACE DUPLA CRISTAL ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.13.18.0002-0 ", nome: "BOX P/ CD FACE SIMPLES CRISTAL ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.75.0010-5 ", nome: "BOX PARA DVD / 03.15.01.9109-2 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0379-6 ", nome: "BRAÇO 0887.1428.3 MARTINI 321 / 03.97.11.9617-9 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0380-0 ", nome: "BRAÇO 36041632-3 MARTINI / 03.97.17.9542-0 ", unid: "UNIDADE" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0381-8 ", nome: "BRAÇO TRANSPORTADOR 2.46.050 POLAR 137 / 03.97.15.9005-5 ", unid: "PEÇA" },
    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.76.0020-7 ", nome: "BROCA AÇO RÁPIDO  3,0MM / 03.45.59.9039-8 ", unid: "UNIDADE" },

















































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































    { almox: "Almoxarifado de Produtos Gráficos", cod: "03.75.