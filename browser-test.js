// Script de diagnostic pour les messages de contact
// À exécuter dans la console du navigateur

console.log('🔍 Diagnostic des messages de contact...');

// Test de connexion Supabase
async function testContactMessagesInBrowser() {
  try {
    // Importer Supabase depuis le module global (si disponible)
    const supabase = window.supabase || (await import('/src/integrations/supabase/client.ts')).supabase;

    console.log('✅ Client Supabase chargé');

    // Test 1: Vérifier la table
    console.log('📋 Test de lecture de la table...');
    const { data, error } = await supabase
      .from('contact_messages')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Erreur lors de la lecture:', error);
      if (error.code === '42P01') {
        console.error('🚨 La table contact_messages n\'existe pas !');
      }
      return false;
    }

    console.log('✅ Table contact_messages accessible');

    // Test 2: Insertion de test
    console.log('📝 Test d\'insertion...');
    const testData = {
      name: 'Test Browser',
      email: 'test@browser.com',
      message: 'Test depuis le navigateur',
      user_agent: navigator.userAgent
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('contact_messages')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('❌ Erreur d\'insertion:', insertError);
      console.error('Code:', insertError.code);
      console.error('Message:', insertError.message);
      return false;
    }

    console.log('✅ Insertion réussie:', insertResult);

    // Nettoyage
    if (insertResult && insertResult[0]) {
      await supabase
        .from('contact_messages')
        .delete()
        .eq('id', insertResult[0].id);
      console.log('🧹 Message de test supprimé');
    }

    return true;
  } catch (error) {
    console.error('💥 Erreur générale:', error);
    return false;
  }
}

// Instructions d'utilisation
console.log(`
📋 Instructions pour le diagnostic:
1. Ouvrez votre site web dans le navigateur
2. Ouvrez les outils de développement (F12)
3. Allez dans l'onglet Console
4. Copiez et collez ce code: testContactMessagesInBrowser()
5. Appuyez sur Entrée pour exécuter
`);

// Export pour utilisation
if (typeof window !== 'undefined') {
  window.testContactMessagesInBrowser = testContactMessagesInBrowser;
}
