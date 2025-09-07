import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, XCircle, Play, RefreshCw, Zap, Search, Activity } from "lucide-react";
import { emailVerificationService } from "../../lib/email-verification";
import { deepEmailDiagnosticService } from "../../lib/email-deep-diagnostic";

const EmailDiagnostic: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [deepResults, setDeepResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const report = await emailVerificationService.runCompleteVerification();
      setResults(report);
    } catch (error) {
      console.error("Erreur diagnostic:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const runDeepInvestigation = async () => {
    setIsRunning(true);
    try {
      console.log("🔍 LANCEMENT INVESTIGATION APPROFONDIE...");
      const report = await deepEmailDiagnosticService.runDeepInvestigation();
      setDeepResults(report);

      // Lancer aussi les tests de stress
      console.log("🔥 LANCEMENT TEST DE STRESS...");
      const stressResults = await deepEmailDiagnosticService.runStressTest();
      console.log("📊 RÉSULTATS STRESS TEST:", stressResults);
    } catch (error) {
      console.error("❌ Erreur investigation:", error);
      alert(
        "❌ Erreur lors de l'investigation approfondie\n\nVérifiez la console pour plus de détails"
      );
    } finally {
      setIsRunning(false);
    }
  };

  const runManualEmailTest = async () => {
    setIsRunning(true);
    try {
      console.log("📧 LANCEMENT TEST MANUEL D'EMAILS...");
      const testResults = await deepEmailDiagnosticService.testManualEmailSending();

      const successCount = testResults.filter((t) => t.success).length;
      alert(
        `📧 TESTS MANUELS TERMINÉS !\n\n` +
          `✅ Succès: ${successCount}/${testResults.length}\n` +
          `📊 Détails complets dans la console\n\n` +
          `💡 Vérifiez les logs pour identifier les problèmes`
      );
    } catch (error) {
      console.error("❌ Erreur tests manuels:", error);
      alert("❌ Erreur lors des tests manuels\n\nVérifiez la console pour plus de détails");
    } finally {
      setIsRunning(false);
    }
  };

  const testEmailSending = async () => {
    setIsRunning(true);
    try {
      await emailVerificationService.testMultipleEmailAddresses();
      alert(
        `📧 Tests d'envoi terminés !\n\n` +
          `💡 Vérifiez la console pour les résultats détaillés\n` +
          `🚨 Rappel : 90% des emails arrivent dans le Spam`
      );
    } catch (error) {
      console.error("Erreur test emails:", error);
      alert("❌ Erreur lors des tests d'envoi\n\nVérifiez la console pour plus de détails");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Diagnostic Emails</h1>
            <p className="text-gray-600">Vérification du système d'envoi d'emails</p>
          </div>
        </div>

        {/* Boutons de test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={runDiagnostic}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
          >
            {isRunning ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>Diagnostic complet</span>
          </button>

          <button
            onClick={testEmailSending}
            disabled={isRunning}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
          >
            <Mail className="w-5 h-5" />
            <span>Test envoi emails</span>
          </button>

          <button
            onClick={runDeepInvestigation}
            disabled={isRunning}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>Investigation approfondie</span>
          </button>

          <button
            onClick={runManualEmailTest}
            disabled={isRunning}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>Tests manuels</span>
          </button>

          <button
            onClick={async () => {
              setIsRunning(true);
              try {
                const logs = await deepEmailDiagnosticService.analyzeSupabaseLogs();
                console.log("📋 LOGS SUPABASE:", logs);
                alert(
                  `📋 ANALYSE LOGS TERMINÉE\n\n` +
                    `Disponibles: ${logs.available ? "Oui" : "Non"}\n` +
                    `Détails dans la console`
                );
              } catch (error) {
                console.error("Erreur logs:", error);
              } finally {
                setIsRunning(false);
              }
            }}
            disabled={isRunning}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
          >
            <Activity className="w-5 h-5" />
            <span>Analyser logs</span>
          </button>
        </div>

        {/* Résultats */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Configuration Resend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🔑 Configuration Resend</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Clé API configurée</span>
                  {results.resendApiKey.configured ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Clé API valide</span>
                  {results.resendApiKey.valid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                {results.resendApiKey.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-600 text-sm">{results.resendApiKey.error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tests d'emails */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📧 Tests d'envoi</h2>
              <div className="space-y-3">
                {Object.entries(results.emailTests).map(([type, test]: [string, any]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">Email {type}</span>
                    {test.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibent text-gray-900 mb-4">🎨 Templates</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Templates complets</span>
                  {results.templates.complete ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Logo inclus</span>
                  {results.templates.hasLogo ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Alertes Spam</span>
                  {results.templates.hasSpamWarning ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Résultats investigation approfondie */}
        {deepResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">
                🔍 Investigation approfondie
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Supabase Auth</h3>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Configuré</span>
                      {deepResults.supabaseAuth.configured ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {deepResults.supabaseAuth.errors.length} erreur(s)
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Service Resend</h3>
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>API valide</span>
                      {deepResults.resendService.apiKeyValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Connectivité: {deepResults.resendService.connectivity ? "OK" : "KO"}
                    </div>
                  </div>
                </div>
              </div>

              {deepResults.recommendations.length > 0 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                  <h4 className="font-medium text-yellow-900 mb-2">💡 Recommandations :</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {deepResults.recommendations.map((rec: string, index: number) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="text-lg font-bold text-yellow-900 mb-4">🚨 Instructions importantes</h3>
            <div className="space-y-2 text-yellow-800 text-sm">
              <p>
                <strong>1. Vérification Spam :</strong> 90% des emails arrivent dans le Spam
              </p>
              <p>
                <strong>2. Dossiers à vérifier :</strong> Spam, Courriers indésirables, Promotions
              </p>
              <p>
                <strong>3. Action requise :</strong> Marquer comme "Pas spam"
              </p>
              <p>
                <strong>4. Prévention :</strong> Ajouter coparentsap@gmail.com aux contacts
              </p>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <h3 className="text-lg font-bold text-red-900 mb-4">🔧 Diagnostic avancé</h3>
            <div className="space-y-2 text-red-800 text-sm">
              <p>
                <strong>Investigation :</strong> Analyse Supabase + Resend + Réseau
              </p>
              <p>
                <strong>Tests manuels :</strong> Envoi direct avec logs détaillés
              </p>
              <p>
                <strong>Logs Supabase :</strong> Analyse des erreurs cachées
              </p>
              <p>
                <strong>Stress test :</strong> Envoi multiple pour détecter les limites
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDiagnostic;
