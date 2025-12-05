# DevOps Interview Q&A SPA

A pure static single-page application providing extensive DevOps interview preparation:
- 30 Q&A per core topic (Linux, Git, Jenkins, Docker, Kubernetes, Terraform, Cloud providers, etc.)
- Additional topics (SaltStack, System Design Basics, DevSecOps, SRE Concepts, more)
- Six quiz modes:
  - Quiz Practice: 50 mixed multiple choice questions
  - Quiz2: 20 image/logo identification MCQs
  - Quiz3: Sequential mixed MCQ (advance only on correct)
  - Quiz4: Sequential Terraform MCQ (IaC focused)
  - Quiz5: Sequential AWS Networking Expert MCQ (advanced VPC, TGW, endpoints, routing, security)
  - Quiz6: Sequential Helm Expert MCQ (advanced chart design, templating, dependencies)
- Features: search, theme toggle (dark/light), accent color picker, copy buttons, animations, accessibility focus handling.

## Folder Structure
```
frontend/
  index.html
  styles.css
  script.js
  images/ (SVG placeholders for Quiz2)
README.md
```
No build step is required. All assets are static.

## Local Preview
From project root:
```zsh
python3 -m http.server 8000
# Then open http://localhost:8000/frontend/
```
Or simply open `frontend/index.html` in a browser (some features like clipboard & localStorage work directly; a local server is closer to deployment environment).

## Deployment Options
### 1. GitHub Pages (Project Site)
1. Initialize and push repository:
```zsh
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin git@github.com:<YOUR_USER>/<REPO>.git
git push -u origin main
```
2. Two approaches:
   - Simplest: move contents of `frontend/` into repository root (or copy them) so `index.html` is at root; commit & push.
   - Keep structure and publish from `frontend/` using a GitHub Actions workflow that copies `frontend` to `gh-pages` branch.
3. Root approach: In repo settings > Pages, select Branch: `main` / root. Site appears at: `https://<YOUR_USER>.github.io/<REPO>/`.
4. If using `gh-pages` branch:
```zsh
git checkout -b gh-pages
git rm -r .
cp -R frontend/* .
git add .
git commit -m "Publish"
git push origin gh-pages
```
   Then set Pages to branch `gh-pages` / root.

### 2. Netlify
1. Drag-and-drop the `frontend` folder in the Netlify UI OR push repo and select it.
2. Set Publish directory to `frontend` (no build command).
3. Optional: Add `_headers` file for cache control if you later optimize.

### 3. Vercel
Vercel expects a root `index.html` for static sites. Options:
- Move `frontend` contents to root before deploying.
- Or create vercel.json specifying `frontend` as root:
```json
{
  "rewrites": [ { "source": "/(.*)", "destination": "/frontend/$1" } ]
}
```
Then deploy via CLI:
```zsh
npm i -g vercel
vercel
```

### 4. GitLab Pages / Other Static Hosts
Any static host works: just point document root to the directory containing `index.html`.

## Recommended Deployment Choice
For simplicity: move `frontend/index.html`, `styles.css`, `script.js`, and `images/` to repository root for GitHub Pages. Update internal image/script links if paths change (currently relative so root move is safe).

## Optional Automation (GitHub Actions)
Add `.github/workflows/deploy.yml`:
```yaml
name: Deploy Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Prepare site
        run: cp -R frontend/* ./
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: .
      - name: Deploy
        uses: actions/deploy-pages@v2
```
Enable Pages for artifact deployments.

## Custom Domain
1. Add DNS `CNAME` pointing to `<YOUR_USER>.github.io`.
2. In Pages settings, set custom domain.
3. Add `CNAME` file (root) with the domain name for persistence.

## Performance & Optimization Tips
- Minify CSS/JS (optional): manually or via a small build step (esbuild, cssnano) before copying to `gh-pages`.
- Set proper cache headers (Netlify `_headers`, or add a service worker if needed).
- Preload critical assets (e.g., add `<link rel="preload" href="styles.css" as="style">`).
- Consider splitting large data object into per-topic JSON files lazy-loaded if initial load gets heavy.

## Accessibility Checklist (Pending Item)
- Ensure focus visible on all interactive elements (already present on buttons).
- Consider adding `aria-live` region for quiz correctness feedback.
- Verify color contrast in light theme: accent vs background.
- Add skip link for faster navigation.

## Troubleshooting
| Issue | Fix |
|-------|-----|
| GitHub Pages 404 | Ensure `index.html` at publish root / branch selected correctly. |
| Images not loading | Verify relative path `images/...` exists at publish root. |
| Clipboard errors | Browser may block insecure context; use HTTPS host. |

## Quick One-Line Publish (gh-pages branch)
```zsh
git subtree push --prefix frontend origin gh-pages
```
(After initial main push) This pushes only the `frontend` directory to `gh-pages`.

## License
Add your preferred license (MIT recommended for open educational content).

---
Feel free to request: score tracking, aria-live enhancement, lazy loading, bundling, or more quiz modes.
