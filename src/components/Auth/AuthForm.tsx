import React, { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, User, Eye, EyeOff, Phone, MessageSquare } from "lucide-react"
import Logo from "../UI/Logo"
import { useAuth } from "../../contexts/AuthContext"
import { supabase } from "../../lib/supabase"

interface AuthFormProps {
  onSuccess: (user: any, profile: any) => void
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { signIn, signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("🔧 CONNEXION AVEC SERVICE RENFORCÉ...")
      const result = await signIn(email, password)

      console.log("✅ CONNEXION RÉUSSIE:", result)
      onSuccess(result.user, result.session)
    } catch (err: any) {
      console.error("❌ ERREUR CONNEXION:", err)
      setError(err.message || "Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!supabase) {
        throw new Error("Veuillez configurer Supabase")
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setError("")
      alert("Email de réinitialisation envoyé ! Vérifiez votre boîte mail (et le dossier Spam).")
      setShowForgotPassword(false)
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de l'email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      console.log("🔧 INSCRIPTION AVEC SERVICE RENFORCÉ...")
      const result = await signUp(email, password, fullName)

      console.log("✅ INSCRIPTION RÉUSSIE:", {
        hasUser: !!result.user,
        hasSession: !!result.session,
        needsConfirmation: result.needsEmailConfirmation,
      })

      if (result.needsEmailConfirmation) {
        alert(
          "✅ INSCRIPTION RÉUSSIE !\n\n" +
            "📧 Email de confirmation requis\n" +
            "🚨 VÉRIFIEZ VOTRE DOSSIER SPAM !\n" +
            "📁 90% des emails arrivent dans le Spam\n\n" +
            "Cliquez sur le lien dans l'email pour activer votre compte."
        )
        setIsLoading(false)
        return
      }

      // Afficher message de succès avec alerte Spam
      alert(
        "✅ INSCRIPTION RÉUSSIE !\n\n" +
          "📧 Email de confirmation envoyé\n" +
          "🔑 Code unique généré\n\n" +
          "🚨 IMPORTANT : VÉRIFIEZ VOTRE DOSSIER SPAM !\n" +
          "📁 90% des emails Co-Parents y arrivent\n" +
          '✅ Marquez comme "Pas spam"'
      )

      onSuccess(result.user, result.profile)
    } catch (err: any) {
      console.error("Erreur inscription:", err)

      // Messages d'erreur plus clairs
      let errorMessage = err.message || "Erreur lors de l'inscription"

      if (errorMessage.includes("row-level security")) {
        errorMessage =
          "Erreur de sécurité lors de la création du profil. Les policies RLS doivent être configurées."
      } else if (errorMessage.includes("email")) {
        errorMessage =
          "Problème avec l'adresse email ou l'envoi de confirmation. Vérifiez votre dossier Spam."
      } else if (errorMessage.includes("password")) {
        errorMessage = "Problème avec le mot de passe. Vérifiez qu'il fait au moins 6 caractères."
      } else if (errorMessage.includes("confirmation email")) {
        errorMessage =
          "Erreur d'envoi d'email. Votre compte a été créé mais l'email de confirmation n'a pas pu être envoyé. Vérifiez votre dossier Spam."
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size="lg" showText={false} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</h1>
              <p className="text-gray-600">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                  {error.includes("email") && (
                    <p className="text-red-600 text-xs mt-2">
                      💡 Si vous ne recevez pas d'email, vérifiez votre dossier Spam
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? "Envoi..." : "Envoyer le lien"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Retour à la connexion
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" showText={false} />
            </div>
            {!isLogin && (
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 inline-block">
                🎉 Essai gratuit 1 mois complet - Sans engagement
              </div>
            )}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-2">
              Co-Parents
            </h1>
            <p className="text-gray-600">
              {isLogin ? "Connectez-vous à votre espace" : "Rejoignez-nous sans engagement"}
            </p>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre nom complet"
                  required
                />
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={isLogin ? handleSignIn : handleEmailSignUp} className="space-y-6">
            {/* Authentification par EMAIL conservée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-xs font-medium">
                    ⚠️ IMPORTANT : Vérifiez TOUJOURS votre dossier SPAM !
                  </p>
                  <p className="text-yellow-700 text-xs">
                    📧 90% des emails Co-Parents arrivent dans le Spam au début.
                  </p>
                </div>
              </div>
            )}

            {/* Message d'information pour l'inscription */}
            {!isLogin && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
                  <p className="text-red-800 text-xs font-bold text-center">
                    🚨 IMPORTANT : VÉRIFIEZ TOUJOURS VOTRE DOSSIER SPAM !
                  </p>
                  <p className="text-red-700 text-xs text-center mt-1">
                    📧 90% des emails Co-Parents arrivent dans le Spam
                  </p>
                </div>
                <div className="bg-orange-100 border border-orange-300 rounded p-3 mb-2">
                  <p className="text-orange-800 text-xs font-bold text-center">
                    📁 Vérifiez : Spam + Courriers indésirables + Promotions
                  </p>
                </div>
                <div className="bg-green-100 border border-green-300 rounded p-3 mb-2">
                  <p className="text-yellow-800 text-xs font-bold text-center">
                    ✅ Marquez comme "Pas spam" + Ajoutez à vos contacts
                  </p>
                </div>
                <div className="bg-blue-100 border border-blue-300 rounded p-3">
                  <p className="text-green-800 text-xs font-bold text-center">
                    📧 Email: coparentsap@gmail.com
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Email de confirmation automatique</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Code unique pour inviter votre co-parent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Synchronisation temps réel</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Données 100% sécurisées</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-600 transition-colors disabled:opacity-50 shadow-lg"
            >
              {isLoading ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError("")
                  setEmail("")
                  setPassword("")
                  setConfirmPassword("")
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
              </button>

              {isLogin && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </div>

            {/* Message d'aide */}
            <div className="text-center mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
                <p className="text-red-800 text-xs font-bold">
                  🚨 RAPPEL IMPORTANT : VÉRIFIEZ LE DOSSIER SPAM !
                </p>
                <p className="text-red-700 text-xs mt-1">
                  📧 90% des emails Co-Parents arrivent dans le Spam
                </p>
                <p className="text-red-700 text-xs">
                  📁 Vérifiez "Spam", "Courriers indésirables", "Promotions"
                </p>
              </div>
              <p className="text-sm text-blue-700 mb-2">Besoin d'aide ? coparentsap@gmail.com</p>

              {/* Alerte Spam pour toutes les erreurs email */}
              {error &&
                (error.includes("email") ||
                  error.includes("confirmation") ||
                  error.includes("spam")) && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-xs font-bold">
                      🚨 PROBLÈME D'EMAIL ? VÉRIFIEZ LE SPAM !
                    </p>
                    <p className="text-yellow-700 text-xs mt-1">
                      📧 90% des emails Co-Parents arrivent dans le Spam
                    </p>
                    <p className="text-yellow-700 text-xs">
                      📁 Vérifiez "Spam", "Courriers indésirables", "Promotions"
                    </p>
                    <p className="text-yellow-700 text-xs">
                      ✅ Marquez comme "Pas spam" + Ajoutez à vos contacts
                    </p>
                  </div>
                )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthForm
