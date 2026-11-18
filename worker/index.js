// Worker minimal : gère la connexion GitHub de /admin (Decap CMS)
// et laisse tout le reste au site statique (dist).
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/oauth/auth') return auth(url, env)
    if (url.pathname === '/oauth/callback') return callback(request, url, env)
    return env.ASSETS.fetch(request)
  },
}

function auth(url, env) {
  const state = crypto.randomUUID()
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/oauth/callback`,
    scope: 'repo',
    state,
  })
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/oauth; Max-Age=600`,
    },
  })
}

async function callback(request, url, env) {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const saved = ((request.headers.get('Cookie') || '').match(/oauth_state=([^;]+)/) || [])[1]

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
