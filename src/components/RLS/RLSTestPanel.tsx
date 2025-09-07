import React, { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Play, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { rlsVerificationService } from "../../lib/rls-verification"

const RLSTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [lastTest, setLastTest] = useState<string>("")

  const runVerification = async () => {
    setIsRunning(true)
    setLastTest("verification")
    try {
      console.log("🔍 LANCEMENT VÉRIFICATION RLS APRÈS NETTOYAGE...")
      const report = await rlsVerificationService.runCompleteVerification()
      setResults(report)

      // Afficher résumé immédiat
      const policiesCount = Object.values(report.tables).reduce(
        (sum, table) => sum + table.policies.length,
        0
      )
      const testsCount = Object.values(report.tables).reduce(
        (sum, table) => sum + table.tests.length,
        0
      )
      const successfulTests = Object.values(report.tables).reduce(
        (sum, table) => sum + table.tests.filter((t) => t.success).length,
        0
      )

      console.log(`📊 RÉSUMÉ VÉRIFICATION:`)
      console.log(`   Policies trouvées: ${policiesCount}`)
      console.log(`   Tests réussis: ${successfulTests}/${testsCount}`)
      console.log(`   Statut global: ${report.overallStatus}`)
    } catch (error) {
      console.error("Erreur vérification RLS:", error)
      alert("❌ Erreur lors de la vérification RLS\n\nVérifiez la console pour plus de détails")
    } finally {
      setIsRunning(false)
    }
  }

  const runFullDiagnostic = async () => {
    setIsRunning(true)
    setLastTest("diagnostic")
    try {
      const diagnostic = await rlsVerificationService.runFullDiagnostic()
      setResults(diagnostic)
    } catch (error) {
      console.error("Erreur diagnostic RLS:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const testSecurity = async () => {
    setIsRunning(true)
    setLastTest("security")
    try {
      const securityTest = await rlsVerificationService.testSecurityIsolation()
      alert(
        `🔒 TEST SÉCURITÉ TERMINÉ\n\n` +
          `Résultat: ${securityTest.success ? "✅ Sécurisé" : "❌ Problème détecté"}\n` +
          `Message: ${securityTest.message}`
      )
    } catch (error) {
      console.error("Erreur test sécurité:", error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tests RLS & Sécurité</h1>
            <p className="text-gray-600">Vérification des policies de sécurité</p>
          </div>
        </div>

        {/* Boutons de test */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={runVerification}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
          >
            {isRunning && lastTest === "verification" ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span>Vérification RLS</span>
          </button>

          <button
            onClick={runFullDiagnostic}
            disabled={isRunning}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
          >
            {isRunning && lastTest === "diagnostic" ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
            <span>Diagnostic complet</span>
          </button>

          <button
            onClick={testSecurity}
            disabled={isRunning}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-4 rounded-lg flex items-center justify-center space-x-2"
          >
            {isRunning && lastTest === "security" ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>Test sécurité</span>
          </button>
        </div>

        {/* Résultats */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Statut global */}
            <div
              className={`p-6 rounded-xl border-2 ${
                results.overallStatus === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                {results.overallStatus === "success" ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <h2
                    className={`text-xl font-bold ${
                      results.overallStatus === "success" ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {results.overallStatus === "success"
                      ? "Système RLS Opérationnel"
                      : "Problèmes Détectés"}
                  </h2>
                  <p
                    className={`${
                      results.overallStatus === "success" ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    Vérification effectuée le {new Date(results.timestamp).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Détails par table */}
            {results.tables &&
              Object.entries(results.tables).map(([tableName, tableData]: [string, any]) => (
                <div
                  key={tableName}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                    🔒 Table {tableName.replace("_", " ")}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span>RLS activé</span>
                      {tableData.rlsEnabled ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Policies trouvées</span>
                      <span className="font-medium">{tableData.policies?.length || 0}</span>
                    </div>
                  </div>

                  {/* Tests */}
                  {tableData.tests && tableData.tests.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Tests fonctionnels :</h4>
                      <div className="space-y-2">
                        {tableData.tests.map((test: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{test.operation}</span>
                            {test.success ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {/* Recommandations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">💡 Recommandations</h3>
                <ul className="space-y-2">
                  {results.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2 text-yellow-800">
                      <span className="text-yellow-600">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4">🔍 À propos des tests RLS</h3>
          <div className="space-y-2 text-blue-800 text-sm">
            <p>
              <strong>Vérification RLS :</strong> Contrôle que les policies existent et sont actives
            </p>
            <p>
              <strong>Diagnostic complet :</strong> Tests de sécurité, cohérence et performance
            </p>
            <p>
              <strong>Test sécurité :</strong> Vérifie l'isolation entre utilisateurs
            </p>
            <p>
              <strong>RLS (Row Level Security) :</strong> Chaque utilisateur ne voit que ses propres
              données
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RLSTestPanel
