# myownmesh.net

Static landing page for [MyOwnMesh](https://github.com/mrjeeves/MyOwnMesh),
served by GitHub Pages at <https://myownmesh.net>.

```
index.html    landing page
download.html full downloads page (desktop bundles + headless daemon)
styles.css    dark theme matching the desktop GUI
main.js       install tabs, copy buttons, live version, download-button wiring
install.sh    one-line installer for macOS / Linux  (served at /install.sh)
install.ps1   one-line installer for Windows         (served at /install.ps1)
CNAME         custom domain
.nojekyll     skip Jekyll processing
```

`download.html` lists every platform's installer. The buttons carry a
`data-asset-pattern` (a RegExp over release asset names); `main.js`
fetches the latest GitHub release and rewrites each button's `href` to
the matching asset, falling back to the `/releases/latest` page when the
API is unreachable or an asset is missing. The patterns are
version-agnostic, so they keep working across releases without edits.

`install.sh` / `install.ps1` are verbatim copies of the main repo's
`scripts/install.{sh,ps1}`, hosted here so the site can offer a
self-contained `curl -fsSL https://myownmesh.net/install.sh | sh` (and
the PowerShell `irm … | iex`) instead of pointing at a raw GitHub URL.
When the scripts change in [MyOwnMesh](https://github.com/mrjeeves/MyOwnMesh),
copy them across again:

```
cp ../MyOwnMesh/scripts/install.sh  install.sh
cp ../MyOwnMesh/scripts/install.ps1 install.ps1
```

Other content is sourced from the main repo's `README.md` and `docs/` —
keep it in sync when those change.

