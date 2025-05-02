import express from 'express';
import authRoutes from './auth';
import apiRoutes from './apiRoutes';
import { getProfile } from '../controllers/authController';
import { createTokens } from '../controllers/tokenController';
import { verifyJWT } from '../middlewares/authJwt';

const router = express.Router();

// Page d'accueil
router.get('/', (req, res) => {
  res.json({
    message: "Service d'authentification API",
    version: '1.0.0',
    status: 'online',
  });
});

// Profil de l'utilisateur
router.get('/profile', getProfile);

// Endpoint direct pour générer un token depuis la session active
router.post('/generate-token', async (req, res) => {
  await createTokens(req, res);
});

// Endpoint direct pour générer un token depuis la session active (GET pour faciliter les tests)
router.get('/generate-token-demo', async (req, res) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié',
      });
    }

    // Générer les tokens en utilisant le même code que dans le contrôleur
    const { generateTokens } = await import('../utils/tokenUtils');
    const tokens = await generateTokens(req.user, req);

    // Définir le refresh token comme cookie HTTP-only
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      sameSite: 'lax',
    });

    // Renvoyer l'access token
    return res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du token:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur: ' + (error.message || 'Erreur inconnue'),
    });
  }
});

// Page de test pour les tokens JWT
router.get('/test-token', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.send(`
      <html>
        <head>
          <title>Test JWT Token</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .error { color: red; padding: 10px; border: 1px solid red; background: #ffeeee; }
            pre { background: #eee; padding: 10px; border-radius: 5px; overflow: auto; }
            button { padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
            code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <h1>Test JWT Token</h1>
          <div class="error">
            <p>Vous n'êtes pas connecté. Veuillez vous <a href="/auth/github">connecter avec GitHub</a> d'abord.</p>
          </div>
        </body>
      </html>
    `);
  }

  // Récupérer les informations utilisateur de manière sécurisée
  const userInfo = req.user as any;
  const userName = userInfo?.displayName || userInfo?.username || userInfo?.id || 'Utilisateur';

  return res.send(`
    <html>
      <head>
        <title>Test JWT Token</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .success { color: green; padding: 10px; border: 1px solid green; background: #eeffee; margin-bottom: 15px; }
          .error { color: red; padding: 10px; border: 1px solid red; background: #ffeeee; }
          .box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ddd; }
          pre { background: #eee; padding: 10px; border-radius: 5px; overflow: auto; }
          button { padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
          button.secondary { background: #5f6368; }
          button.copy { background: #34a853; }
          #result { margin-top: 20px; }
          code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
          .hidden { display: none; }
          .debug { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Test JWT Token</h1>
        
        <div class="box">
          <h2>Utilisateur</h2>
          <div class="success">
            <p>Vous êtes connecté en tant que: <strong>${userName}</strong></p>
          </div>
          <button id="showUserInfo">Afficher les détails utilisateur</button>
          <pre id="userInfo" class="hidden">${JSON.stringify(userInfo, null, 2)}</pre>
        </div>
        
        <div class="box">
          <h2>Générer des tokens JWT</h2>
          <p>Cliquez sur le bouton ci-dessous pour générer un token JWT:</p>
          <button id="generateToken">Générer Token JWT</button>
          <button id="showDebug" class="secondary">Afficher le mode debug</button>
        </div>
        
        <div id="result"></div>
        
        <div id="debugOutput" class="debug hidden">
          <h3>Debug:</h3>
          <pre id="debugInfo"></pre>
        </div>
        
        <script>
          // Afficher/masquer les informations utilisateur
          document.getElementById('showUserInfo').addEventListener('click', () => {
            const userInfo = document.getElementById('userInfo');
            if (userInfo.classList.contains('hidden')) {
              userInfo.classList.remove('hidden');
              document.getElementById('showUserInfo').textContent = 'Masquer les détails';
            } else {
              userInfo.classList.add('hidden');
              document.getElementById('showUserInfo').textContent = 'Afficher les détails utilisateur';
            }
          });
          
          // Afficher/masquer le mode debug
          document.getElementById('showDebug').addEventListener('click', () => {
            const debug = document.getElementById('debugOutput');
            if (debug.classList.contains('hidden')) {
              debug.classList.remove('hidden');
              document.getElementById('showDebug').textContent = 'Masquer le mode debug';
            } else {
              debug.classList.add('hidden');
              document.getElementById('showDebug').textContent = 'Afficher le mode debug';
            }
          });
          
          // Fonction pour copier du texte
          function copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          }
          
          // Générer un token JWT
          document.getElementById('generateToken').addEventListener('click', async () => {
            const resultDiv = document.getElementById('result');
            const debugDiv = document.getElementById('debugInfo');
            
            resultDiv.innerHTML = '<div class="box"><h3>Génération du token en cours...</h3></div>';
            
            try {
              // Utiliser l'endpoint GET au lieu de POST
              const response = await fetch('/generate-token-demo', {
                method: 'GET',
                credentials: 'include'
              });
              
              // Récupérer à la fois le texte brut et le JSON pour le débogage
              const responseText = await response.text();
              let data;
              
              try {
                data = JSON.parse(responseText);
                debugDiv.textContent = "Réponse brute: " + responseText;
              } catch (e) {
                debugDiv.textContent = "Erreur de parsing JSON: " + e.message + "\\n\\nRéponse brute: " + responseText;
                throw new Error("La réponse du serveur n'est pas un JSON valide");
              }
              
              resultDiv.innerHTML = '<div class="box"><h3>Résultat:</h3>';
              
              if (data.success) {
                const token = data.data.accessToken;
                
                resultDiv.innerHTML += \`
                  <div class="success">Tokens générés avec succès!</div>
                  <h4>Access Token:</h4>
                  <pre>\${token}</pre>
                  <button class="copy" onclick="copyToClipboard('\${token}')">Copier le token</button>
                  <p>Ce token expire dans: \${data.data.expiresIn}</p>
                  
                  <h4>Tester avec l'API protégée:</h4>
                  <p>Utilisez cette commande curl:</p>
                  <pre>curl -H "Authorization: Bearer \${token}" http://localhost:3000/api/protected</pre>
                  <button class="copy" onclick="copyToClipboard('curl -H \\\\"Authorization: Bearer \${token}\\\\" http://localhost:3000/api/protected')">Copier la commande</button>
                \`;
              } else {
                resultDiv.innerHTML += \`
                  <div class="error">Erreur: \${data.message || 'Erreur inconnue'}</div>
                  <p>Vérifiez que vous êtes bien connecté et essayez à nouveau.</p>
                \`;
              }
              
              resultDiv.innerHTML += '</div>';
            } catch (error) {
              debugDiv.textContent = "Erreur JavaScript: " + error.message;
              resultDiv.innerHTML = \`
                <div class="box">
                  <div class="error">Erreur: \${error.message}</div>
                  <p>Une erreur s'est produite lors de la communication avec le serveur.</p>
                  <p>Vérifiez la console du navigateur et le mode debug pour plus de détails.</p>
                </div>
              \`;
            }
          });
          
          // Fonction globale pour copier du texte
          window.copyToClipboard = function(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            alert('Copié dans le presse-papiers!');
          };
        </script>
      </body>
    </html>
  `);
});

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes API protégées
router.use('/api', verifyJWT, apiRoutes);

router.get('/demo-token', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.send(`
      <html>
        <head>
          <title>Test JWT Token</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .error { color: red; padding: 10px; border: 1px solid red; background: #ffeeee; }
            .box { padding: 20px; border: 1px solid #ddd; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Test JWT Token</h1>
          <div class="error">
            <p>Vous n'êtes pas connecté. Veuillez vous <a href="/auth/github">connecter avec GitHub</a> d'abord.</p>
          </div>
        </body>
      </html>
    `);
  }

  return res.send(`
    <html>
      <head>
        <title>Demo Token</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .success { color: green; padding: 10px; border: 1px solid green; background: #eeffee; }
          .box { padding: 20px; border: 1px solid #ddd; margin-top: 20px; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
          .button { display: inline-block; padding: 10px 20px; background: #4285f4; color: white; 
                    text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>Demo Token</h1>
        
        <div class="success">
          <p>Vous êtes connecté</p>
        </div>
        
        <div class="box">
          <h2>1. Générer un token JWT</h2>
          <p>Cliquez sur le lien ci-dessous pour générer un token JWT:</p>
          <a href="/generate-token-demo" class="button" target="_blank">Générer Token JWT</a>
          <p>Un nouvel onglet s'ouvrira avec le token au format JSON.</p>
        </div>
        
        <div class="box">
          <h2>2. Tester l'API protégée</h2>
          <p>Une fois le token généré, copiez-le et utilisez-le dans cette commande curl:</p>
          <pre>curl -H "Authorization: Bearer VOTRE_TOKEN_ICI" http://localhost:3000/api/protected</pre>
        </div>
        
        <div class="box">
          <h2>3. Verifier l'utilisateur actuel</h2>
          <p>Vérifiez les informations de votre profil:</p>
          <a href="/profile" class="button" target="_blank">Voir Profil</a>
        </div>
      </body>
    </html>
  `);
});

export default router;
