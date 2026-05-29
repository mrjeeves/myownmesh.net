/* MyOwnMesh site — pull the latest GitHub release on load and stamp the
   tag into the version badge, the status line, and the embed snippet.
   The versions hardcoded in index.html are the fallback: if the API is
   unreachable (offline, rate-limited), the page still shows a sensible
   number instead of a blank. */

(function () {
  const REPO = 'mrjeeves/MyOwnMesh';
  const API = `https://api.github.com/repos/${REPO}/releases/latest`;

  // ---------- install-platform tabs ----------
  // Default to whatever the markup says is active (Unix), then override
  // with the detected OS so visitors see the right snippet first.
  function wireInstallTabs() {
    const tabs = document.querySelectorAll('.install-tabs .tab');
    const panels = document.querySelectorAll('.install-snippet');
    if (!tabs.length || !panels.length) return;

    function activate(os) {
      tabs.forEach((t) => {
        const on = t.dataset.os === os;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach((p) => {
        p.classList.toggle('active', p.dataset.os === os);
      });
    }

    const ua = (navigator.userAgentData && navigator.userAgentData.platform)
      || navigator.platform
      || navigator.userAgent
      || '';
    activate(/win/i.test(ua) ? 'windows' : 'unix');

    tabs.forEach((t) => {
      t.addEventListener('click', () => activate(t.dataset.os));
    });
  }

  // ---------- live version stamp ----------
  // tag_name arrives as "v0.1.3". The badge and embed snippet keep the
  // leading "v"; the status line uses the bare number to match its copy.
  function stampVersion(tagName) {
    if (!tagName) return;
    const withV = tagName.charAt(0) === 'v' ? tagName : `v${tagName}`;
    const bare = withV.replace(/^v/, '');

    const badge = document.getElementById('version-badge');
    if (badge) badge.textContent = withV;

    const status = document.getElementById('version-status');
    if (status) status.textContent = bare;

    document.querySelectorAll('.js-dep-tag').forEach((el) => {
      el.textContent = withV;
    });
  }

  async function fetchLatest() {
    try {
      const res = await fetch(API, {
        headers: { 'Accept': 'application/vnd.github+json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const r = await res.json();
      stampVersion(r.tag_name);
    } catch (err) {
      // Network failure, rate limit, etc. The hardcoded markup stands in.
      console.warn('[myownmesh.net] could not load latest release:', err);
    }
  }

  // ---------- boot ----------
  wireInstallTabs();
  fetchLatest();
})();
