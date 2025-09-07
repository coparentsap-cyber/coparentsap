# 📱 OÙ TROUVER LE FICHIER APK ?

## 🔍 **SITUATION 1 : VOUS N'AVEZ PAS ENCORE GÉNÉRÉ L'APK**

### **L'APK n'existe pas encore !**
Si vous venez de télécharger le projet, l'APK n'existe pas. Il faut le créer :

```bash
# 1. Aller dans le dossier du projet
cd ~/Desktop/co-parents

# 2. Installer les dépendances
npm install

# 3. Construire l'app
npm run build

# 4. Synchroniser avec Android
npx cap sync android

# 5. Ouvrir Android Studio
npx cap open android

# 6. Dans Android Studio :
# Menu > Build > Build Bundle(s)/APK(s) > Build APK(s)
```

---

## 📁 **SITUATION 2 : VOUS AVEZ DÉJÀ GÉNÉRÉ L'APK**

### **Emplacements possibles de l'APK :**

**A. Emplacement standard :**
```
📁 [votre-projet]/android/app/build/outputs/apk/debug/app-debug.apk
```

**B. Chemin complet sur Mac :**
```
📁 ~/Desktop/co-parents/android/app/build/outputs/apk/debug/app-debug.apk
```

**C. Dans Finder :**
1. **📁 Ouvrez** Finder
2. **🔍 Recherchez** "app-debug.apk"
3. **📱 Ou** naviguez vers le dossier android/app/build/outputs/apk/debug/

---

## 🔍 **COMMENT VÉRIFIER SI L'APK EXISTE**

### **Méthode 1 - Terminal :**
```bash
# Chercher l'APK dans votre projet
find ~/Desktop/co-parents -name "*.apk" -type f

# Si ça retourne un chemin, l'APK existe
# Si ça ne retourne rien, l'APK n'existe pas
```

### **Méthode 2 - Finder :**
1. **📁 Ouvrez** Finder
2. **🔍 Cmd + F** pour rechercher
3. **📝 Tapez** "app-debug.apk"
4. **📂 Limitez** la recherche au dossier de votre projet

---

## 🚨 **SI VOUS NE TROUVEZ PAS L'APK**

### **C'est normal ! Il faut le créer :**

1. **📥 Téléchargez** Android Studio : https://developer.android.com/studio
2. **📂 Ouvrez** votre projet téléchargé
3. **🔨 Générez** l'APK avec Android Studio

### **Commandes à exécuter :**
```bash
# Dans le dossier de votre projet :
npm run build
npx cap sync android
npx cap open android
```

### **Dans Android Studio :**
- **Menu** : Build > Build Bundle(s)/APK(s) > Build APK(s)
- **Attendez** "BUILD SUCCESSFUL"
- **Cliquez** "locate" pour voir l'APK

---

## 📲 **APRÈS AVOIR TROUVÉ L'APK**

### **Pour l'installer sur votre téléphone :**

**Option 1 - Email :**
1. **📧 Attachez** l'APK à un email
2. **📤 Envoyez** à vous-même
3. **📱 Ouvrez** sur votre téléphone
4. **📲 Installez**

**Option 2 - USB :**
1. **🔌 Connectez** votre téléphone
2. **📁 Copiez** l'APK dans Téléchargements
3. **📱 Installez** depuis le gestionnaire de fichiers

**Option 3 - AirDrop (si Android compatible) :**
1. **📤 Partagez** via AirDrop
2. **📱 Recevez** sur votre téléphone

---

## 🎯 **ACTIONS IMMÉDIATES**

### **Si l'APK n'existe pas :**
1. **📥 Installez** Android Studio
2. **🔨 Générez** l'APK
3. **📱 Installez** sur téléphone

### **Si l'APK existe :**
1. **📁 Trouvez-le** dans android/app/build/outputs/apk/debug/
2. **📧 Envoyez-le** vous par email
3. **📱 Installez** sur téléphone

**Dites-moi si vous avez déjà Android Studio installé !** 🔧