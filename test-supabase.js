// Script de test Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('🔍 Test de connexion Supabase...\n');

  // Test 1: Connexion
  console.log('📡 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Test 2: Vérifier les tables
  console.log('\n📊 Vérification des tables...');
  const { data: tables, error: tablesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (tablesError) {
    console.error('❌ Erreur tables:', tablesError.message);
    console.log('\n⚠️  La table "profiles" n\'existe pas !');
    console.log('👉 Tu dois exécuter le SQL dans Supabase SQL Editor');
  } else {
    console.log('✅ Table "profiles" existe');
  }

  // Test 3: Tester l'inscription
  console.log('\n🧪 Test d\'inscription...');
  const testEmail = `test${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'Test1234!',
    options: {
      data: {
        username: 'testuser',
        full_name: 'Test User',
      },
    },
  });

  if (authError) {
    console.error('❌ Erreur signup:', authError.message);
  } else {
    console.log('✅ Signup réussi:', authData.user.email);

    // Vérifier si le profil a été créé
    if (authData.user) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profil non créé:', profileError.message);
        console.log('\n⚠️  Le trigger "handle_new_user" ne fonctionne pas !');
      } else {
        console.log('✅ Profil créé automatiquement:', profile.username);
      }
    }
  }
}

testConnection().catch(console.error);
