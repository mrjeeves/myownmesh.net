/* MyOwnMesh site — shared script for the landing page and the download
   page. On load it pulls the latest GitHub release and then, depending
   on which elements are present:
     - index.html: stamps the tag into the version badge, status line,
       and embed snippet (the hardcoded markup is the offline fallback);
     - download.html: points each download button at the matching
       release asset, fills the "latest release" line, and suggests a
       build for the visitor's platform.
   Every wiring function is a no-op when its target elements are absent,
   so the same file drives both pages. */

(function () {
  const REPO = 'mrjeeves/MyOwnMesh';
  const API = `https://api.github.com/repos/${REPO}/releases/latest`;
  const LATEST_PAGE = `https://github.com/${REPO}/releases/latest`;

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

  // ---------- copy buttons ----------
  // Each button carries the exact command in data-copy, so we copy a
  // clean one-liner rather than scraping the comment line out of the
  // <pre>. Falls back to a hidden textarea when the async clipboard API
  // is unavailable (insecure context, older browsers).
  function wireCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy || '';
        if (!text) return;
        let ok = false;
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { ok = document.execCommand('copy'); } catch {}
          ta.remove();
        }
        const label = btn.dataset.label || btn.textContent;
        btn.dataset.label = label;
        btn.textContent = ok ? 'Copied' : 'Press ⌘C';
        btn.classList.add('copied');
        clearTimeout(btn._copyTimer);
        btn._copyTimer = setTimeout(() => {
          btn.textContent = label;
          btn.classList.remove('copied');
        }, 1500);
      });
    });
  }

  // ---------- platform detection (best effort) ----------
  // Only used to pre-select a suggested download. Never load-bearing —
  // every platform's builds are one click away regardless.
  function detectPlatform() {
    const ua = navigator.userAgent || '';
    const platform = (navigator.userAgentData && navigator.userAgentData.platform)
      || navigator.platform || '';
    const hay = `${platform} ${ua}`;
    const isArm = /arm|aarch64/i.test(hay);
    if (/mac/i.test(hay)) return { os: 'mac', label: 'a Mac' };
    if (/win/i.test(hay)) return { os: 'windows', label: 'Windows' };
    if (/linux|android/i.test(hay)) {
      // aarch64 Linux is most likely a Pi or other arm64 board.
      if (isArm) return { os: 'pi', label: 'a Raspberry Pi or arm64 Linux' };
      return { os: 'linux', label: 'Linux' };
    }
    return { os: 'unknown', label: 'your computer' };
  }

  // ---------- download buttons (download.html) ----------
  // Each button declares a data-asset-pattern (a RegExp matched against
  // release asset names). On success we point it at the asset URL; if
  // nothing matches — older release, or the API was unreachable — the
  // button keeps its markup href to the /releases/latest landing page.
  function matchAsset(assets, pattern) {
    let re;
    try { re = new RegExp(pattern); } catch { return null; }
    for (const name of Object.keys(assets)) {
      if (re.test(name)) return { name, url: assets[name] };
    }
    return null;
  }

  function wireDownloadButtons(release) {
    const btns = document.querySelectorAll('[data-asset-pattern]');
    if (!btns.length) return;
    btns.forEach((btn) => {
      const match = release && matchAsset(release.assets, btn.getAttribute('data-asset-pattern'));
      if (match) {
        btn.setAttribute('href', match.url);
        btn.setAttribute('data-asset-name', match.name);
        btn.removeAttribute('data-asset-missing');
      } else {
        btn.setAttribute('href', LATEST_PAGE);
        btn.setAttribute('data-asset-missing', 'true');
      }
    });
  }

  function fmtDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return ''; }
  }

  function showReleaseInfo(release) {
    const el = document.getElementById('release-info');
    if (!el) return;
    if (!release) {
      el.textContent = "Couldn't reach the GitHub releases API — the buttons below go to the releases page instead.";
      return;
    }
    const tag = release.tag.charAt(0) === 'v' ? release.tag : `v${release.tag}`;
    const date = fmtDate(release.published);
    el.innerHTML = `Latest release: <a class="link" href="${release.htmlUrl}">${tag}</a>${date ? ` · ${date}` : ''}`;
  }

  // Pick a sensible default build for the visitor and reveal the
  // suggested-download box. Defaults to Apple Silicon on Macs (most
  // modern Macs) and the .deb on Linux / Pi.
  function setSuggested(release) {
    const box = document.getElementById('suggested');
    const label = document.getElementById('suggested-os');
    const btn = document.getElementById('suggested-btn');
    if (!box || !btn || !release) return;

    const plat = detectPlatform();
    if (label) label.textContent = plat.label;

    let pattern = null;
    let title = 'Download MyOwnMesh';
    if (plat.os === 'mac') {
      pattern = 'MyOwnMesh_[0-9.]+_aarch64\\.dmg$';
      title = 'Download for Mac (Apple Silicon)';
    } else if (plat.os === 'windows') {
      pattern = 'MyOwnMesh_[0-9.]+_x64-setup\\.exe$';
      title = 'Download for Windows';
    } else if (plat.os === 'pi') {
      pattern = 'MyOwnMesh_[0-9.]+_arm64\\.deb$';
      title = 'Download for Raspberry Pi (.deb)';
    } else if (plat.os === 'linux') {
      pattern = 'MyOwnMesh_[0-9.]+_amd64\\.deb$';
      title = 'Download for Linux (.deb)';
    }

    let url = LATEST_PAGE;
    if (pattern) {
      const match = matchAsset(release.assets, pattern);
      if (match) url = match.url;
    }
    btn.textContent = title;
    btn.setAttribute('href', url);
    box.hidden = false;
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

      const assets = {};
      for (const a of r.assets || []) assets[a.name] = a.browser_download_url;
      const release = {
        tag: r.tag_name,
        published: r.published_at,
        assets,
        htmlUrl: r.html_url
      };
      wireDownloadButtons(release);
      showReleaseInfo(release);
      setSuggested(release);
    } catch (err) {
      // Network failure, rate limit, etc. index.html keeps its hardcoded
      // version; download.html falls back to the releases-page links.
      console.warn('[myownmesh.net] could not load latest release:', err);
      showReleaseInfo(null);
    }
  }

  // ---------- boot ----------
  wireInstallTabs();
  wireCopyButtons();
  fetchLatest();
})();
