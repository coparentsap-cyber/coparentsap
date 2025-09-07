# 📱 GÉNÉRER VOTRE APK EN 10 MINUTES

## 🎯 **MÉTHODE ULTRA-RAPIDE**

### **ÉTAPE 1 : Installer Android Studio** (5 min)
1. **Téléchargez** : https://developer.android.com/studio
2. **Installez** avec paramètres par défaut
3. **Acceptez** toutes les licences

### **ÉTAPE 2 : Ouvrir votre projet** (2 min)
```bash
# Dans votre terminal (ici) :
npx cap open android
```
☝️ **Android Studio va s'ouvrir automatiquement**

### **ÉTAPE 3 : Générer l'APK** (3 min)
1. **Attendez** l'indexation (barre de progression en bas)
2. **Menu** : `Build > Build Bundle(s)/APK(s) > Build APK(s)`
3. **Attendez** la compilation (1-2 min)
4. **Cliquez** "locate" quand c'est fini

### **ÉTAPE 4 : Récupérer l'APK**
📁 **Emplacement** : `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📲 **INSTALLER SUR VOTRE TÉLÉPHONE**

### **Méthode 1 - USB** (Recommandée)
1. **Connectez** votre téléphone en USB
2. **Copiez** l'APK dans Téléchargements
3. **Sur le téléphone** : Gestionnaire de fichiers > Téléchargements
4. **Tapez** sur l'APK > Installer

### **Méthode 2 - Email**
1. **Envoyez-vous** l'APK par email
2. **Ouvrez** l'email sur votre téléphone
3. **Téléchargez** l'APK
4. **Installez**

### **Méthode 3 - Cloud**
1. **Uploadez** sur Google Drive/Dropbox
2. **Téléchargez** depuis votre téléphone
3. **Installez**

---

## ⚙️ **PRÉPARER VOTRE TÉLÉPHONE**

### **Activer "Sources inconnues" :**

**Android 8+ :**
1. **Paramètres** > Sécurité et confidentialité
2. **Plus de paramètres** > Installer des apps inconnues
3. **Choisir** votre navigateur/gestionnaire de fichiers
4. **Autoriser** cette source

**Android 7 et moins :**
1. **Paramètres** > Sécurité
2. **Cocher** "Sources inconnues"

---

## 🚀 **COMMANDES À EXÉCUTER**

### **Dans votre terminal ici :**
```bash
# 1. Construire l'app web
npm run build

# 2. Synchroniser avec Android
npx cap sync android

# 3. Ouvrir Android Studio
npx cap open android
```

### **Dans Android Studio :**
```
1. Attendez l'indexation complète
2. Build > Build Bundle(s)/APK(s) > Build APK(s)
3. Attendez "BUILD SUCCESSFUL"
4. Cliquez "locate" pour trouver l'APK
```

---

## 🎯 **RÉSULTAT FINAL**

**Dans 10 minutes vous aurez :**
- 📱 **APK de test** prêt à installer
- 📲 **App Co-Parents** sur votre téléphone
- 🧪 **Tests complets** possibles

**Commencez par télécharger Android Studio !** 🚀