# 💻 GUIDE COMPLET - RÉCUPÉRER VOTRE PROJET SUR MAC

## 🎯 **OBJECTIF**
Transférer votre projet Co-Parents depuis cet environnement web vers votre Mac pour générer l'APK.

---

## 📥 **MÉTHODE 1 : TÉLÉCHARGEMENT DIRECT (RECOMMANDÉE)**

### **A. Télécharger le projet complet**
1. **Cliquez** sur le bouton "Download" en haut à droite de cet écran
2. **Ou** utilisez le raccourci : `Cmd + Shift + D`
3. **Sauvegardez** le fichier ZIP sur votre Mac
4. **Décompressez** le ZIP dans un dossier (ex: `~/Documents/co-parents`)

### **B. Ouvrir dans Terminal**
```bash
# Naviguez vers le dossier
cd ~/Documents/co-parents

# Installez les dépendances
npm install

# Testez que ça marche
npm run dev
```

---

## 📥 **MÉTHODE 2 : COPIER-COLLER MANUEL**

### **A. Créer le dossier sur Mac**
```bash
# Créez un nouveau dossier
mkdir ~/Documents/co-parents
cd ~/Documents/co-parents

# Initialisez un projet
npm init -y
```

### **B. Copier les fichiers principaux**
Copiez ces fichiers depuis cet écran vers votre Mac :

**Fichiers essentiels :**
- `package.json` → Dépendances
- `vite.config.ts` → Configuration Vite
- `tsconfig.json` → Configuration TypeScript
- `tailwind.config.js` → Configuration Tailwind
- `capacitor.config.ts` → Configuration Capacitor
- `src/` → Tout le code source
- `public/` → Assets et icônes

### **C. Installer les dépendances**
```bash
npm install
```

---

## 📥 **MÉTHODE 3 : GITHUB (SI VOUS AVEZ UN COMPTE)**

### **A. Créer un repo GitHub**
1. **Allez sur** : https://github.com
2. **Créez** un nouveau repository "co-parents-app"
3. **Copiez** l'URL du repo

### **B. Cloner sur Mac**
```bash
# Clonez le repo vide
git clone https://github.com/[votre-username]/co-parents-app.git
cd co-parents-app

# Copiez tous les fichiers depuis cet écran
# Puis :
git add .
git commit -m "Initial commit"
git push
```

---

## 🔧 **APRÈS RÉCUPÉRATION SUR MAC**

### **A. Vérifier que tout fonctionne**
```bash
# Dans le dossier du projet
npm install
npm run dev
```
☝️ **L'app doit s'ouvrir sur http://localhost:5173**

### **B. Installer Android Studio**
1. **Téléchargez** : https://developer.android.com/studio
2. **Installez** sur votre Mac
3. **Acceptez** toutes les licences

### **C. Préparer pour Android**
```bash
# Construire l'app
npm run build

# Synchroniser avec Android
npx cap sync android

# Ouvrir Android Studio
npx cap open android
```

---

## 📱 **GÉNÉRER L'APK SUR MAC**

### **Dans Android Studio :**
1. **Attendez** l'indexation complète (5-10 min)
2. **Menu** : `Build > Build Bundle(s)/APK(s) > Build APK(s)`
3. **Attendez** "BUILD SUCCESSFUL"
4. **Cliquez** "locate" pour trouver l'APK

### **Emplacement de l'APK :**
```
📁 [votre-projet]/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📲 **INSTALLER L'APK SUR VOTRE TÉLÉPHONE**

### **Méthode AirDrop (Mac → iPhone/Android)**
1. **Sélectionnez** l'APK dans Finder
2. **Clic droit** > Partager > AirDrop
3. **Envoyez** vers votre téléphone Android

### **Méthode Email**
1. **Attachez** l'APK à un email
2. **Envoyez** à vous-même
3. **Ouvrez** sur votre téléphone
4. **Téléchargez** et installez

### **Méthode USB**
1. **Connectez** votre téléphone en USB
2. **Copiez** l'APK dans le dossier Téléchargements
3. **Sur le téléphone** : Gestionnaire de fichiers
4. **Installez** l'APK

---

## 🎨 **ASSETS VISUELS CRÉÉS**

### ✅ **DÉJÀ PRÊTS :**
- 🎨 **Icône HD 512x512px** → `public/icon-512-hd.png`
- 🖼️ **Bannière marketing** → `public/feature-graphic.svg`
- 📱 **Icônes multiples** → Toutes les tailles
- 📝 **Textes complets** → Description Google Play

### 📸 **SCREENSHOTS À PRENDRE** (10 min)
1. **Ouvrez** votre app dans Safari
2. **Mode responsive** : Développeur > Responsive Design Mode
3. **Taille** : iPhone 12 Pro
4. **Capturez** 5 écrans : Accueil, Planning, Messages, Photos, Contacts

---

## ⚡ **ACTIONS IMMÉDIATES**

### **MAINTENANT :**
1. **📥 Téléchargez** le projet (bouton Download en haut)
2. **📥 Téléchargez** Android Studio
3. **📸 Prenez** vos 5 screenshots pendant l'installation

### **DANS 30 MINUTES :**
1. **🔧 Ouvrez** le projet dans Android Studio
2. **📱 Générez** l'APK
3. **📲 Installez** sur votre téléphone

### **DANS 1 HEURE :**
1. **🎉 Testez** votre app sur téléphone
2. **💳 Créez** compte Google Play Console (25$)
3. **🚀 Publiez** sur Google Play Store

**Commencez par cliquer sur "Download" en haut à droite de cet écran !** 📥

**Votre APK sera prêt dans 45 minutes maximum !** 🚀