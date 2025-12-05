# DevOps Interview Q&A SPA

A comprehensive static single-page application for DevOps interview preparation with interactive learning features:

## 🎯 Features

### 📚 Study Content
- **30 Q&A per core topic** covering:
  - Linux, Git, GitHub, Jenkins
  - Docker, Docker Commands, Kubernetes, Kubernetes Commands
  - OpenShift, Helm, Terraform
  - AWS, Azure, GCP
  - Ansible, SaltStack, Prometheus, Grafana
  - SRE, CI/CD, DevSecOps, Networking
  - System Design Basics, Shell Scripting

### 🎮 Quiz Modes

#### Topic-Based Sequential Quizzes (NEW!)
- **26+ Individual Topic Quizzes** - One quiz for each DevOps topic
- **10 Questions per Topic** - Mix of MCQ, True/False, and Fill-in-the-blank
- **Progress Tracking** - Track completion status and best scores
- **Difficulty Levels** - Beginner, Intermediate, Advanced badges
- **Smart Feedback** - Instant answer validation with explanations
- **Score History** - View attempts and best scores for each topic
- **Celebration Effects** - Confetti animation for quiz completion (≥70%)

#### Challenge Quizzes
1. **Quiz Practice** - 50 mixed multiple choice questions
2. **Logo Recognition** - 20 image/logo identification MCQs
3. **Sequential General** - 30 mixed MCQ (advance only on correct)
4. **Terraform Deep Dive** - 30 IaC focused questions
5. **AWS Networking** - 30 advanced VPC, TGW, endpoints questions
6. **Helm Expert** - 30 advanced chart design & templating questions

### 🎨 User Experience
- **Dark/Light Theme Toggle** - Comfortable reading in any environment
- **4 Accent Colors** - Blue, Green, Purple, Orange
- **Progress Dashboard** - Visual tracking of topics studied
- **Search Functionality** - Quick content filtering
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Enhanced with transitions and effects
- **Accessibility** - ARIA labels, keyboard navigation support
- **LocalStorage Persistence** - Saves progress, theme, and preferences

## Folder Structure
```
frontend/
  index.html
## 📁 Folder Structure
```
frontend/
  index.html         - Main SPA structure
  styles.css         - Complete styling with themes & animations
  script.js          - App logic, quiz engine, progress tracking
  images/            - SVG placeholders for logo quiz
  questions.json     - (Optional) External data source
README.md            - This file
.github/workflows/   - GitHub Actions for deployment
```
No build step required. All assets are static and framework-free.

## 🚀 Quick Start

### Local Development
```zsh
# Clone or navigate to project
cd learningproject

# Start local server
python3 -m http.server 8000

# Open browser
open http://localhost:8000/frontend/
```

Or simply open `frontend/index.html` directly in a browser.

## 🎓 Using the Quiz System

### Topic Quizzes
1. Click **"Quizzes"** tab in sidebar
2. Select **"Topic Quizzes"** featured card
3. Choose any topic (Linux, Docker, Kubernetes, etc.)
4. Answer 10 questions sequentially
5. View instant feedback after each question
6. Get detailed results with score, time, and review
7. Track progress across all topics

### Question Types
- **Multiple Choice** - Select correct option (A/B/C/D)
- **True/False** - Simple binary choice
- **Fill in the Blank** - Type answer (hints provided)

### Scoring & Progress
- **70%+ to pass** (7/10 questions)
- **Best scores saved** automatically
- **Attempt history** tracked per topic
- **Completion badges** for mastered topics
- **Difficulty levels** show topic complexity

### Challenge Quizzes
Access from Quiz Center for specialized practice modes with different formats and difficulty levels.

## 💾 Data Persistence
All progress saved automatically in browser localStorage:
- Quiz scores and completion status
- Best attempts per topic
- Study progress (topics viewed)
- Theme preferences (dark/light)
- Accent color selection

## 🎨 Customization

### Themes
- Toggle between dark/light mode
- 4 accent colors: Blue, Green, Purple, Orange
- Smooth transitions and animations
- Reduced motion support for accessibility

### Progress Tracking
- View learning progress dashboard
- See completion percentages
- Track viewed vs. unviewed topics
- Reset progress if needed

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
