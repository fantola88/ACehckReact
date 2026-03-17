import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import { produtos } from '../data/produtos';

// SUA CONFIGURAÇÃO DO FIREBASE - COLE AQUI SEUS DADOS REAIS
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  databaseURL: "SEU_DATABASE_URL",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

async function atualizarProdutos() {
  console.log('🚀 Iniciando atualização dos produtos...');
  console.log(`📦 Total de produtos: ${produtos.length}`);
  
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    
    // Preparar dados
    const produtosObject: Record<string, any> = {};
    const produtosPorAlmox: Record<string, Record<string, any>> = {};
    
    produtos.forEach((produto) => {
      const key = produto.cod.replace(/[^a-zA-Z0-9]/g, '_');
      
      const produtoData = {
        ...produto,
        id: key,
        updatedAt: new Date().toISOString()
      };
      
      produtosObject[key] = produtoData;
      
      const almoxKey = produto.almox
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      
      if (!produtosPorAlmox[almoxKey]) {
        produtosPorAlmox[almoxKey] = {};
      }
      produtosPorAlmox[almoxKey][key] = produtoData;
    });

    console.log('📤 Enviando para o Firebase...');
    
    // Salvar
    await set(ref(db, 'produtos'), produtosObject);
    console.log('✅ /produtos atualizado');
    
    await set(ref(db, 'produtosPorAlmox'), produtosPorAlmox);
    console.log('✅ /produtosPorAlmox atualizado');
    
    const produtosList = produtos.map(p => ({
      ...p,
      id: p.cod.replace(/[^a-zA-Z0-9]/g, '_')
    }));
    await set(ref(db, 'produtosList'), produtosList);
    console.log('✅ /produtosList atualizado');
    
    console.log('\n🎉 Concluído!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
}

atualizarProdutos();