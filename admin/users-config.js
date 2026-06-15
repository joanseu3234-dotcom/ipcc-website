// IPCC 後台用戶設定
// 此檔案由後台帳號管理自動產生，請勿手動修改

window.IPCC_FRONTEND_URL  = 'https://ipcc-website.vercel.app';
window.IPCC_GITHUB_REPO   = 'joanseu3234-dotcom/ipcc-website';
window.IPCC_GITHUB_BRANCH = 'main';
// GitHub 金鑰已移除，改由伺服器端 /api/publish 以 Vercel 環境變數保管

window.IPCC_USERS_CONFIG = [
  {
    "id": "admin-root",
    "username": "admin",
    "password": "sha256$b9c1e8055ff48893b0e13f6148a5e3ddbc3ee1a67d75df6405abc5f298d4c135",
    "displayName": "超級管理員",
    "isSuper": true,
    "permissions": {
      "home": true,
      "about": true,
      "services": true,
      "news": true,
      "cases": true,
      "settings": true,
      "users": true
    },
    "createdAt": 1775951284136,
    "lastLogin": 1781538136715
  },
  {
    "id": "mo01aonyqrv79",
    "username": "Tara",
    "displayName": "直效副理",
    "password": "sha256$b9c1e8055ff48893b0e13f6148a5e3ddbc3ee1a67d75df6405abc5f298d4c135",
    "isSuper": false,
    "permissions": {
      "home": true,
      "about": true,
      "services": true,
      "news": true,
      "cases": true,
      "contacts": true,
      "settings": true,
      "users": true
    },
    "createdAt": 1776256564318,
    "lastLogin": 1777564713590
  },
  {
    "id": "mo0v75v1cnlbl",
    "username": "Nydia",
    "displayName": "總監",
    "password": "sha256$b9c1e8055ff48893b0e13f6148a5e3ddbc3ee1a67d75df6405abc5f298d4c135",
    "isSuper": false,
    "permissions": {
      "home": true,
      "about": true,
      "services": true,
      "news": true,
      "cases": true,
      "contacts": true,
      "settings": true,
      "users": true
    },
    "createdAt": 1776306788461,
    "lastLogin": null
  }
];
