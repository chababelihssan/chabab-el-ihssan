<?php
// الخطوة 1: يحوّل المستخدم إلى صفحة الموافقة في GitHub
$cfg = require dirname(__DIR__, 2) . '/cei-oauth-config.php'; // خارج public_html (فيه السر)

$state = bin2hex(random_bytes(16));
setcookie('oauth_state', $state, [
    'expires'  => time() + 600,
    'path'     => '/oauth',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

$params = http_build_query([
    'client_id'    => $cfg['client_id'],
    'redirect_uri' => rtrim($cfg['site_url'], '/') . '/oauth/callback',
    'scope'        => $cfg['scope'] ?? 'public_repo', // public_repo = أقل صلاحية (المستودع عام). للمستودع الخاص ضع 'repo' في ملف الإعدادات
    'state'        => $state,
]);

header('Location: https://github.com/login/oauth/authorize?' . $params, true, 302);
exit;
