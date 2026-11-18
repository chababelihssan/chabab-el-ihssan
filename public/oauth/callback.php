<?php
// الخطوة 2: GitHub يرجع هنا بـ code ← نبدّله بـ access_token ونسلّمه لنافذة /admin
$cfg = require dirname(__DIR__, 2) . '/cei-oauth-config.php';

$code  = $_GET['code']  ?? '';
$state = $_GET['state'] ?? '';
$saved = $_COOKIE['oauth_state'] ?? '';

if ($code === '' || $state === '' || !hash_equals($saved, $state)) {
    $message = 'authorization:github:error:' . json_encode(['message' => 'Invalid state']);
} else {
    $ch = curl_init('https://github.com/login/oauth/access_token');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json', 'User-Agent: cei-admin'],
        CURLOPT_POSTFIELDS     => json_encode([
            'client_id'     => $cfg['client_id'],
            'client_secret' => $cfg['client_secret'],
            'code'          => $code,
        ]),
    ]);
    $res  = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($res ?: '{}', true) ?: [];

    $message = !empty($data['access_token'])
        ? 'authorization:github:success:' . json_encode(['token' => $data['access_token'], 'provider' => 'github'])
        : 'authorization:github:error:'   . json_encode($data ?: ['message' => 'No response from GitHub']);
}

$origin = rtrim($cfg['site_url'], '/');
$flags  = JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT;
$msgJs  = json_encode($message, $flags);
$orgJs  = json_encode($origin, $flags);

setcookie('oauth_state', '', ['expires' => time() - 3600, 'path' => '/oauth']);
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-store');
?>
<!doctype html><html><body><script>
(function () {
  var msg = <?= $msgJs ?>;
  var target = <?= $orgJs ?>;
  function receive(e) {
    if (e.origin !== target) return;
    window.opener.postMessage(msg, target);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', target);
})();
</script></body></html>
