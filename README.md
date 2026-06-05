# myownmesh.net

Static landing page for [MyOwnMesh](https://github.com/mrjeeves/MyOwnMesh),
served by GitHub Pages at <https://myownmesh.net>.

```
index.html    landing page
styles.css    dark theme matching the desktop GUI
main.js       install-tab switcher, copy buttons, live release version
install.sh    one-line installer for macOS / Linux  (served at /install.sh)
install.ps1   one-line installer for Windows         (served at /install.ps1)
CNAME         custom domain
.nojekyll     skip Jekyll processing
```

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

