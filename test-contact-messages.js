// Test script pour vérifier la table contact_messages
import { supabase } from "./src/integrations/supabase/client.ts";

async function testContactMessages() {
  console.log('🔍 Test de la table contact_messages...');
  
  try {
    // Test 1: Vérifier si la table existe en tentant de lire
    console.log('📋 Test 1: Lecture de la table...');
    const { data: readTest, error: readError } = await supabase
      .from('contact_messages')
      .select('*')
      .limit(1);
    
    if (readError) {
      console.error('❌ Erreur de lecture:', readError);
      return;
    }
    console.log('✅ Table accessible, nombre d\'enregistrements:', readTest?.length || 0);
    
    // Test 2: Tentative d'insertion d'un message de test
    console.log('📝 Test 2: Insertion d\'un message de test...');
    const testMessage = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Ceci est un message de test pour vérifier l\'insertion.',
      user_agent: navigator.userAgent || 'Test Agent'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('contact_messages')
      .insert(testMessage)
      .select();
    
    if (insertError) {
      console.error('❌ Erreur d\'insertion:', insertError);
      console.error('Code:', insertError.code);
      console.error('Message:', insertError.message);
      console.error('Détails:', insertError.details);
      return;
    }
    
    console.log('✅ Message inséré avec succès:', insertData);
    
    // Test 3: Nettoyage - supprimer le message de test
    if (insertData && insertData[0]) {
      console.log('🧹 Test 3: Nettoyage du message de test...');
      const { error: deleteError } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('⚠️ Erreur lors du nettoyage:', deleteError);
      } else {
        console.log('✅ Message de test supprimé');
      }
    }
    
    console.log('🎉 Tous les tests sont passés avec succès !');
    
  } catch (error) {
    console.error('💥 Erreur générale:', error);
  }
}

// Exécuter le test
testContactMessages();
