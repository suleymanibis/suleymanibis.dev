# suleymanibis.dev

Personal portfolio website for [suleymanibis](https://github.com/suleymanibis). The site is a build-free static frontend that runs on GitHub Pages and presents pinned GitHub repositories, repository README files, release downloads, personal articles, and contact information.

## How the site works

- `index.html` contains the page structure and Turkish user-facing text.
- `styles.css` provides the responsive layout, dark/light theme, cards, dialogs, tabs, and rendered README styles.
- `app.js` loads project metadata, fetches README and release data, renders safe Markdown, and controls the dialogs, tabs, theme, and mobile menu.
- `config.js` is the central customization file for the GitHub username, profile links, email address, homepage copy, and project metadata fallback.
- `articles.js` contains both standalone articles and article content that can be attached to a project.
- `generated/pinned-projects.js` contains the latest generated pinned repository list.
- `CNAME` configures the custom domain `suleymanibis.dev`.

No bundler, package manager, or build step is required. The browser loads the ES modules directly.

## Pinned repositories and automatic synchronization

GitHub's public REST API does not expose a user's pinned repository list. The repository therefore uses a two-part approach:

1. `.github/workflows/sync-pinned-repos.yml` runs every day at `03:17 UTC` and can also be started manually with **Actions → Sync pinned repositories → Run workflow**.
2. `scripts/sync-pinned-repos.mjs` queries GitHub GraphQL `pinnedItems` using the temporary Actions `GITHUB_TOKEN`, then writes the ordered result to `generated/pinned-projects.js`.

The token is used only inside GitHub Actions. It is never included in the public site, generated JavaScript, or Pages artifact. When the generated file changes, the workflow commits and pushes it. A subsequent push to `main` triggers the Pages deployment workflow.

`config.js` contains `manualProjects` as a metadata fallback. It supplies custom titles, Turkish summaries, tags, visual accents, and project-to-article links. The generated list controls which pinned repositories are displayed; matching entries in `manualProjects` enrich those generated projects. Add a repository to `manualProjects` when it needs custom metadata or an `articleId`, but do not edit `generated/pinned-projects.js` manually.

## README and release data

When a visitor opens a project:

1. The project metadata is requested from the public GitHub REST API.
2. The README is fetched first from `https://raw.githubusercontent.com/{owner}/{repo}/HEAD/README.md`, which avoids the unauthenticated GitHub API rate limit.
3. If the raw endpoint fails, the site tries the GitHub REST README endpoint and decodes its base64 content as UTF-8.
4. If both requests fail, the Turkish fallback message `Bu proje için README içeriği alınamadı.` is shown and the failure is logged to the browser console.
5. Release assets are loaded from the public GitHub releases API. If a release has an asset, the first asset is shown as a direct download button.

README Markdown is rendered without inserting source HTML. The renderer supports headings, paragraphs, ordered and unordered lists, links, images and badges, inline code, fenced code blocks, tables, blockquotes, emphasis, and horizontal rules. Unsafe HTML is escaped, and unsupported URL schemes such as `javascript:` and `data:` are rejected.

## Adding an article

Articles are edited directly in `articles.js`; no CMS or database is used.

### Add a standalone article

1. Open `articles.js`.
2. Add an object to the exported `articles` array.
3. Give it a unique `id`.
4. Fill in `title`, `date`, `readingTime`, `excerpt`, and `content`.
5. Write `content` as a JavaScript template literal using the supported Markdown syntax.
6. Save the file and refresh the site. The article appears in the **Articles** section automatically.

Example:

```js
{
  id: "my-new-article",
  title: "My new article",
  date: "26 October 2026",
  readingTime: "3 min read",
  excerpt: "A short summary shown on the article card.",
  content: `## First section

Write the article here using Markdown.

Use \`inline code\` when needed.`
}
```

### Attach an article to a project

1. Add the article to `articles.js` as described above.
2. Open `config.js`.
3. Find the matching repository entry in `manualProjects`.
4. Add `articleId` with exactly the same value as the article's `id`:

```js
{
  repo: "commerce-cart-api-java",
  title: "Commerce Cart API",
  summary: "Custom project summary.",
  tags: ["Java", "API"],
  accent: "blue",
  articleId: "my-new-article"
}
```

5. Open the project details on the site. A second **Article** tab appears next to **README**.

If the repository is newly pinned and is not yet present in `manualProjects`, add its metadata there to enable a custom title, summary, tags, accent, or Article tab. The automatic sync will still determine whether it is displayed as a pinned repository.

## Customization

Edit `config.js` to change:

- `githubUsername` and `githubProfileUrl`
- `linkedinUrl`
- `email`
- `intro` and `about`
- `manualProjects` metadata and project article links

Edit `articles.js` for article content. Edit `index.html` for page sections and Turkish labels. Edit `styles.css` for visual changes. Do not edit `generated/pinned-projects.js` directly because the synchronization workflow overwrites it.

## Local preview and validation

Because the site uses browser ES modules, serve it through a local HTTP server instead of opening `index.html` directly:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`.

The repository has no npm test or build script. Before pushing changes, run the checks used by this project:

```powershell
node --check app.js
node --check config.js
node --check articles.js
node --check scripts/sync-pinned-repos.mjs
git diff --check
```

To run the pinned repository synchronization locally, provide a GitHub token through the environment. Never commit the token:

```powershell
$env:GITHUB_TOKEN = gh auth token
$env:GITHUB_USERNAME = "suleymanibis"
node scripts/sync-pinned-repos.mjs
```

The synchronization script requires GraphQL access and writes only `generated/pinned-projects.js`.

## GitHub Pages deployment

`.github/workflows/pages.yml` deploys the repository root to GitHub Pages when changes are pushed to `main`. It can also be started manually with **Actions → Deploy static site to GitHub Pages → Run workflow**.

To enable deployment:

1. Merge the site branch into `main`.
2. In the repository, open **Settings → Pages**.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. Wait for the Pages workflow to complete.

The site is not live from this feature branch until it is merged into `main` and Pages is enabled.

## Custom domain

The `CNAME` file contains:

```text
suleymanibis.dev
```

Configure the DNS provider for the apex domain with the current GitHub Pages A records. If you also use `www`, configure the GitHub Pages CNAME record for that hostname. After DNS propagation, return to **Settings → Pages**, confirm the custom domain, and enable HTTPS enforcement when GitHub makes it available.

The public site does not contain a GitHub token. Public GitHub metadata, README, and release requests are made from the browser, so temporary API rate limits can affect metadata or release loading; the README path specifically uses the raw-content endpoint first.
