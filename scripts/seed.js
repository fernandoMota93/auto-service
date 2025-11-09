/**
 * Seeder para o projeto Grilo Repair Shop
 * Executa: node scripts/seed.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializa com serviceAccountKey.json na raiz
const serviceAccount = require(path.resolve(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

(async () => {
  try {
    console.log('🌱 Iniciando seed do Firebase...');

    // Criar usuários Auth
    const adminUser = await auth.createUser({
      email: 'admin@grilomecanica.com',
      password: 'admin123',
      displayName: 'Luiz Fernando Grilo'
    });

    const normalUser = await auth.createUser({
      email: 'joao@grilomecanica.com',
      password: 'joao123',
      displayName: 'João Mecânico'
    });

    // Roles e dados no Firestore
    await db.collection('users').doc(adminUser.uid).set({
      uid: adminUser.uid,
      name: 'Luiz Fernando Grilo',
      email: adminUser.email,
      role: 'admin',
      active: true,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection('users').doc(normalUser.uid).set({
      uid: normalUser.uid,
      name: 'João Mecânico',
      email: normalUser.email,
      role: 'user',
      active: true,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Criar veículo vinculado ao usuário
    const vehicleRef = await db.collection('vehicles').add({
      owner_id: normalUser.uid,
      brand: 'Volkswagen',
      model: 'Gol G5',
      plate: 'ABC-1234',
      year: 2014,
      color: 'Prata',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Criar OS vinculada ao veículo e admin
    await db.collection('orders').add({
      client_id: normalUser.uid,
      vehicle_id: vehicleRef.id,
      description: 'Troca de embreagem e revisão geral',
      services: [
        { name: 'Troca de óleo', value: 120 },
        { name: 'Troca de embreagem', value: 450 },
        { name: 'Filtro de ar', value: 40 }
      ],
      status: 'in_progress',
      images: [],
      created_by: adminUser.uid,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Seed finalizado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  }
})();
