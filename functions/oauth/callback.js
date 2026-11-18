// Étape 2 : GitHub revient ici, on échange le code contre un token
// et on le renvoie à la fenêtre /admin (Decap CMS).
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookie = request.headers.get('Cookie') || ''
  const saved = (cookie.match(/oauth_state=([^;]+)/) || [])[1]

  let message
  if (!code || !state || state !== saved) {
    message = 'authorization:github:error:' + JSON.stringify({ message: 'Invalid state' })
  } else {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const data = await res.json()
    message = data.access_token
      ? 'authorization:github:success:' + JSON.stringify({ token: data.access_token, provider: 'github' })
      : 'authorization:github:error:' + JSON.stringify(data)
  }

  const origin = url.origin
  const safe = JSON.stringify(message).replace(/</g, '\\u003c')
  const html = `<!doctype html><html><body><script>
(function () {
  var msg = ${safe};
  var target = ${JSON.stringify(origin)};
  function receive(e) {
    if (e.origin !== target) return;
    window.opener.postMessage(msg, target);
    window.removeEventListener('message', receive, false);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', target);
})();
</script></body></html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'oauth_state=; Path=/oauth; Max-Age=0',
    },
  })
}
