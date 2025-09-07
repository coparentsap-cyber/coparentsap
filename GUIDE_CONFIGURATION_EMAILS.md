## 📧 GUIDE CONFIGURATION EMAILS - CO-PARENTS

### 🎯 **OBJECTIF**
Configurer l'envoi automatique d'emails pour les invitations et confirmations dans votre application Co-Parents.

---

## 🔧 **ÉTAPE 1 : CRÉER COMPTE RESEND (GRATUIT)**

### **A. Inscription**
1. **Allez sur** : https://resend.com
2. **Cliquez** : "Get Started for Free"
3. **Inscrivez-vous** avec votre email
4. **Vérifiez** votre email

### **B. Obtenir la clé API**
1. **Connectez-vous** à votre dashboard Resend
2. **Allez dans** : API Keys
3. **Cliquez** : "Create API Key"
4. **Nom** : "Co-Parents App"
5. **Copiez** la clé (commence par `re_`)

---

## ⚙️ **ÉTAPE 2 : CONFIGURER DANS SUPABASE**

### **A. Variables d'environnement**
1. **Allez dans** votre projet Supabase
2. **Settings** > **Environment Variables**
3. **Ajoutez** ces variables :

```
RESEND_API_KEY=re_votre_cle_api_ici
FROM_EMAIL=Co-Parents <noreply@coparentsap.gmail.com>
APP_URL=https://votre-app.netlify.app
```

### **B. Vérifier les fonctions Edge**
Les fonctions sont déjà créées dans `/supabase/functions/` :
- `send-invitation` → Envoi invitations
- `send-email` → Service email générique

---

## 📧 **ÉTAPE 3 : TESTER LES EMAILS**

### **A. Test d'inscription**
1. **Inscrivez-vous** avec un nouvel email
2. **Vérifiez** la réception de l'email de bienvenue
3. **Contenu attendu** :
   - Logo Co-Parents
   - Code unique (CP-XXXXXXXX)
   - Instructions

### **B. Test d'invitation**
1. **Allez dans** Paramètres > Connexion Co-Parents
2. **Entrez** un email de test
3. **Cliquez** "Envoyer invitation"
4. **Vérifiez** la réception de l'email

---

## 🔍 **ÉTAPE 4 : VÉRIFICATION**

### **Emails qui doivent être envoyés :**
- ✅ **Email de bienvenue** après inscription
- ✅ **Email d'invitation** co-parent
- ✅ **Email de réinitialisation** mot de passe
- ✅ **Notifications** de changements importants

### **Contenu des emails :**
- ✅ **Logo Co-Parents** en header
- ✅ **Design professionnel** violet-rose
- ✅ **Code d'invitation** bien visible
- ✅ **Liens de téléchargement** Android/iOS
- ✅ **Instructions claires**

---

## 🚨 **DÉPANNAGE**

### **Si les emails ne partent pas :**
1. **Vérifiez** la clé API Resend
2. **Vérifiez** les variables d'environnement
3. **Testez** depuis le dashboard Resend
4. **Regardez** les logs Supabase

### **Si les emails arrivent en spam :**
1. **Configurez** un domaine personnalisé dans Resend
2. **Ajoutez** les enregistrements DNS
3. **Vérifiez** la réputation du domaine

---

## 🎯 **RÉSULTAT ATTENDU**

Après configuration, votre application enverra automatiquement :

### **Email de bienvenue :**
```
De: Co-Parents <noreply@coparentsap.gmail.com>
À: nouvel.utilisateur@email.com
Sujet: 🎉 Bienvenue sur Co-Parents !

Contenu:
- Logo Co-Parents
- Message personnalisé
- Code unique : CP-A1B2C3D4
- Instructions étape par étape
- Lien vers l'app
```

### **Email d'invitation :**
```
De: Co-Parents <noreply@coparentsap.gmail.com>
À: coparent@email.com
Sujet: [Nom] vous invite sur Co-Parents 👨‍👩‍👧‍👦

Contenu:
- Nom de l'inviteur
- Code de connexion
- Liens téléchargement
- Instructions détaillées
```

**Votre système d'emails sera opérationnel en 15 minutes !** 📧✨