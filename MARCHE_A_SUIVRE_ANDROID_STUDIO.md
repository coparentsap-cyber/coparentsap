# 📱 MARCHE À SUIVRE COMPLÈTE - ANDROID STUDIO

## 🎯 **OBJECTIF**
Transférer votre projet Co-Parents vers Android Studio et générer l'APK avec le bon logo.

---

## 📥 **ÉTAPE 1 : RÉCUPÉRER LE PROJET (5 minutes)**

### **A. Télécharger depuis cet écran**
1. **📥 Cliquez** sur le bouton "Download" en haut à droite
2. **📁 Sauvegardez** le fichier ZIP sur votre Mac
3. **📂 Décompressez** dans un dossier (ex: Bureau/co-parents)

### **B. Ouvrir le Terminal**
```bash
# Allez dans le dossier
cd ~/Desktop/co-parents

# Installez les dépendances
npm install

# Vérifiez que ça marche
npm run dev
```
☝️ **L'app doit s'ouvrir sur http://localhost:5173**

---

## 🔧 **ÉTAPE 2 : INSTALLER ANDROID STUDIO (30 minutes)**

### **A. Téléchargement**
1. **🌐 Allez sur** : https://developer.android.com/studio
2. **📥 Cliquez** : "Download Android Studio"
3. **⏳ Attendez** le téléchargement (3-4 GB)

### **B. Installation sur Mac**
1. **📦 Ouvrez** le fichier DMG téléchargé
2. **📁 Glissez** Android Studio dans le dossier Applications
3. **🚀 Lancez** Android Studio depuis Applications
4. **✅ Suivez** l'assistant d'installation :
   - Choisissez "Standard" setup
   - Acceptez toutes les licences
   - Attendez le téléchargement des SDK (15-20 min)

---

## 📱 **ÉTAPE 3 : PRÉPARER LE PROJET ANDROID (10 minutes)**

### **A. Dans votre Terminal**
```bash
# Assurez-vous d'être dans le bon dossier
cd ~/Desktop/co-parents

# 1. Construire l'application web
npm run build

# 2. Synchroniser avec Android (IMPORTANT pour le logo)
npx cap sync android

# 3. Ouvrir Android Studio avec le projet
npx cap open android
```

### **B. Première ouverture dans Android Studio**
1. **⏳ Attendez** l'indexation complète (5-10 minutes)
   - Barre de progression en bas de l'écran
   - Ne touchez à rien pendant ce temps
2. **✅ Vérifiez** qu'il n'y a pas d'erreurs rouges
3. **🔍 Explorez** la structure du projet dans le panneau de gauche

---

## 🔨 **ÉTAPE 4 : GÉNÉRER L'APK (5 minutes)**

### **A. Méthode simple (APK de debug)**
1. **📋 Menu** : `Build > Build Bundle(s)/APK(s) > Build APK(s)`
2. **⏳ Attendez** la compilation (2-3 minutes)
3. **✅ Message** "BUILD SUCCESSFUL" apparaît
4. **📁 Cliquez** sur "locate" dans la notification

### **B. Emplacement de l'APK créé**
```
📁 Votre APK sera ici :
~/Desktop/co-parents/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📲 **ÉTAPE 5 : INSTALLER L'APK SUR TÉLÉPHONE**

### **A. Préparer votre téléphone Android**
1. **⚙️ Paramètres** > Sécurité et confidentialité
2. **🔓 Installer des apps inconnues** > Autoriser votre navigateur/gestionnaire de fichiers

### **B. Transférer l'APK**

**Option 1 - AirDrop (Mac → Android)**
1. **📁 Finder** > Trouvez votre APK
2. **📤 Clic droit** > Partager > AirDrop
3. **📱 Envoyez** vers votre téléphone

**Option 2 - Email**
1. **📧 Créez** un nouvel email
2. **📎 Attachez** le fichier APK
3. **📤 Envoyez** à vous-même
4. **📱 Ouvrez** l'email sur votre téléphone
5. **📥 Téléchargez** et installez l'APK

**Option 3 - USB**
1. **🔌 Connectez** votre téléphone en USB
2. **📁 Copiez** l'APK dans le dossier Téléchargements
3. **📱 Gestionnaire de fichiers** > Téléchargements
4. **📲 Tapez** sur l'APK > Installer

---

## 🎨 **ÉTAPE 6 : VÉRIFIER LE LOGO**

### **A. Après installation**
1. **👀 Regardez** l'icône sur l'écran d'accueil
2. **✅ Vérifiez** que c'est le logo Co-Parents :
   - Fond dégradé violet-rose-bleu
   - Cœur blanc au centre
   - Point violet dans le cœur

### **B. Si le logo n'est pas correct**
```bash
# Resynchroniser et regénérer
npx cap sync android
npx cap open android
# Build > Build APK à nouveau
```

---

## 🚨 **PROBLÈMES COURANTS ET SOLUTIONS**

### **Android Studio ne s'ouvre pas**
```bash
# Vérifiez Java
java -version

# Si pas installé, téléchargez Java 11+
```

### **Erreur "Command not found: npx"**
```bash
# Installez Node.js
brew install node

# Ou téléchargez depuis : https://nodejs.org
```

### **L'APK ne s'installe pas**
- ✅ Vérifiez "Sources inconnues" activées
- 🔄 Redémarrez le téléphone
- 📱 Essayez un autre gestionnaire de fichiers

### **Erreur de compilation**
```bash
# Nettoyez et recommencez
npm run build
npx cap sync android
```

---

## ⏱️ **TEMPS TOTAL ESTIMÉ**

### **Si Android Studio n'est pas installé :**
- **Téléchargement projet** : 2 min
- **Installation Android Studio** : 30 min
- **Préparation projet** : 10 min
- **Génération APK** : 5 min
- **TOTAL** : 45-50 minutes

### **Si Android Studio est déjà installé :**
- **Téléchargement projet** : 2 min
- **Préparation** : 10 min
- **Génération APK** : 5 min
- **TOTAL** : 15-20 minutes

---

## 🎯 **ACTIONS IMMÉDIATES**

### **MAINTENANT :**
1. **📥 Téléchargez** le projet (bouton Download)
2. **📥 Téléchargez** Android Studio si pas installé

### **PENDANT L'INSTALLATION D'ANDROID STUDIO :**
```bash
cd ~/Desktop/co-parents
npm install
npm run dev
```

### **QUAND ANDROID STUDIO EST PRÊT :**
```bash
npm run build
npx cap sync android
npx cap open android
```

**Dans 45 minutes maximum, vous aurez votre APK avec le bon logo Co-Parents !** 🚀

**Commencez par télécharger le projet maintenant !** 📥