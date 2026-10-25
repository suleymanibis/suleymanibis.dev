import { siteConfig } from "./config.js";
import { articles } from "./articles.js";
import { pinnedProjects } from "./generated/pinned-projects.js";

const base = "https://api.github.com";
const grid = document.querySelector("#project-grid");
const articlesGrid = document.querySelector("#article-grid");
const dialog = document.querySelector("#dialog");
const content = document.querySelector("#dialog-content");
const manualProjectsByRepo = new Map(siteConfig.manualProjects.map((project) => [project.repo, project]));
const projects = pinnedProjects.length
  ? pinnedProjects.map((project) => {
    const fallback = manualProjectsByRepo.get(project.repo);
    return {
      ...project,
      ...fallback,
      repo: project.repo,
      summary: fallback?.summary || project.summary,
      tags: fallback?.tags || [project.language].filter(Boolean)
    };
  })
  : siteConfig.manualProjects;

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[c]));

function safeUrl(value, baseUrl = "") {
  try {
    const url = new URL(value, baseUrl || window.location.href);
    if (!["http:", "https:", "mailto:"].includes(url.protocol)) return "";
    return url.href;
  } catch {
    return "";
  }
}

function inlineMarkdown(value, baseUrl = "") {
  const source = String(value);
  let output = "";
  let index = 0;
  const patterns = [
    { regex: /^!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)/, render: (match) => {
      const url = safeUrl(match[2], baseUrl);
      return url ? `<img src="${esc(url)}" alt="${esc(match[1])}"${match[3] ? ` title="${esc(match[3])}"` : ""} loading="lazy">` : esc(match[0]);
    } },
    { regex: /^\[([^\]]+)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)/, render: (match) => {
      const url = safeUrl(match[2], baseUrl);
      return url ? `<a href="${esc(url)}" target="_blank" rel="noreferrer">${inlineMarkdown(match[1], baseUrl)}</a>` : esc(match[0]);
    } },
    { regex: /^`([^`]+)`/, render: (match) => `<code>${esc(match[1])}</code>` },
    { regex: /^\*\*(.+?)\*\*|^__(.+?)__/, render: (match) => `<strong>${inlineMarkdown(match[1] || match[2], baseUrl)}</strong>` },
    { regex: /^~~(.+?)~~/, render: (match) => `<del>${inlineMarkdown(match[1], baseUrl)}</del>` },
    { regex: /^\*(.+?)\*|^_(.+?)_/, render: (match) => `<em>${inlineMarkdown(match[1] || match[2], baseUrl)}</em>` },
    { regex: /^(https?:\/\/[^\s<]+)/, render: (match) => `<a href="${esc(safeUrl(match[1]))}" target="_blank" rel="noreferrer">${esc(match[1])}</a>` }
  ];
  while (index < source.length) {
    const match = patterns.map((item) => ({ item, match: source.slice(index).match(item.regex) }))
      .find((item) => item.match);
    if (match) {
      output += match.item.render(match.match);
      index += match.match[0].length;
    } else {
      output += esc(source[index]);
      index += 1;
    }
  }
  return output;
}

function md(markdown = "", baseUrl = "") {
  const lines = String(markdown).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    const fence = line.match(/^ {0,3}(```+|~~~+)\s*([\w+-]*)\s*$/);
    if (fence) {
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].match(new RegExp(`^ {0,3}${fence[1][0]}{${fence[1].length},}`))) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      const language = fence[2] ? ` class="language-${esc(fence[2])}"` : "";
      output.push(`<pre><code${language}>${esc(code.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      output.push(`<h${heading[1].length}>${inlineMarkdown(heading[2], baseUrl)}</h${heading[1].length}>`);
      index += 1;
      continue;
    }
    if (/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      output.push("<hr>");
      index += 1;
      continue;
    }
    if (/^ {0,3}>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^ {0,3}>\s?/.test(lines[index])) quote.push(lines[index++].replace(/^ {0,3}>\s?/, ""));
      output.push(`<blockquote>${md(quote.join("\n"), baseUrl)}</blockquote>`);
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line) || /^\s*\d+[.)]\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items = [];
      while (index < lines.length) {
        const item = lines[index].match(ordered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-*+]\s+(.+)$/);
        if (!item) break;
        items.push(`<li>${inlineMarkdown(item[1], baseUrl)}</li>`);
        index += 1;
      }
      output.push(`<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`);
      continue;
    }
    if (line.includes("|") && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1])) {
      const cells = (value) => value.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
      const headers = cells(line);
      const alignments = cells(lines[index + 1]);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(cells(lines[index++]));
      }
      output.push(`<div class="table-wrap"><table><thead><tr>${headers.map((cell, cellIndex) => `<th${alignments[cellIndex]?.startsWith(":") ? ` style="text-align:${alignments[cellIndex].endsWith(":") ? "center" : "left"}"` : alignments[cellIndex]?.endsWith(":") ? ' style="text-align:right"' : ""}>${inlineMarkdown(cell, baseUrl)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, cellIndex) => `<td>${inlineMarkdown(row[cellIndex] || "", baseUrl)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^( {0,3}(#{1,6})\s+| {0,3}>| {0,3}(```|~~~)|\s*[-*+]\s+|\s*\d+[.)]\s+)/.test(lines[index])) paragraph.push(lines[index++]);
    output.push(`<p>${inlineMarkdown(paragraph.join("\n").replace(/\n/g, " "), baseUrl)}</p>`);
  }
  return output.join("");
}

async function api(url) {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${url}`);
  return response.json();
}

async function repo(name) {
  try {
    return await api(`${base}/repos/${siteConfig.githubUsername}/${name}`);
  } catch (error) {
    console.warn(`[portfolio] Repository metadata unavailable for ${name}.`, error);
    return null;
  }
}

function card(project, repository) {
  const title = project.title || repository?.name || project.repo;
  const description = project.summary || repository?.description || "GitHub üzerinde yayınlanan bir proje.";
  const tags = project.tags || [repository?.language].filter(Boolean);
  return `<article class="card accent-${esc(project.accent || "blue")}"><div class="card-top"><b>${esc(project.repo.slice(0, 2).toUpperCase())}</b><a href="${esc(repository?.html_url || `https://github.com/${siteConfig.githubUsername}/${project.repo}`)}" target="_blank" rel="noreferrer" aria-label="${esc(title)} GitHub'da aç">↗</a></div><div><small>${esc(repository?.language || tags[0] || "Proje")}</small><h3>${esc(title)}</h3><p>${esc(description)}</p></div><div class="tags">${tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div><button class="read" data-repo="${esc(project.repo)}" type="button">Detayları gör →</button></article>`;
}

async function renderProjects() {
  const data = await Promise.all(projects.map(async (project) => ({ project, repository: await repo(project.repo) })));
  grid.innerHTML = data.map(({ project, repository }) => card(project, repository)).join("");
  grid.querySelectorAll("[data-repo]").forEach((button) => { button.onclick = () => openProject(button.dataset.repo); });
}

function renderArticles() {
  articlesGrid.innerHTML = articles.map((article, index) => `<article class="card article"><div class="meta">0${index + 1} · ${esc(article.date)} · ${esc(article.readingTime)}</div><h3>${esc(article.title)}</h3><p>${esc(article.excerpt)}</p><button class="read" data-article="${esc(article.id)}" type="button">Makaleyi oku →</button></article>`).join("");
  articlesGrid.querySelectorAll("[data-article]").forEach((button) => { button.onclick = () => openArticle(button.dataset.article); });
}

async function readme(name) {
  const rawUrl = `https://raw.githubusercontent.com/${siteConfig.githubUsername}/${name}/HEAD/README.md`;
  try {
    const response = await fetch(rawUrl);
    if (!response.ok) throw new Error(`Raw README ${response.status} for ${rawUrl}`);
    return await response.text();
  } catch (rawError) {
    console.warn(`[portfolio] Raw README unavailable for ${name}; trying GitHub API fallback.`, rawError);
    try {
      const data = await api(`${base}/repos/${siteConfig.githubUsername}/${name}/readme`);
      const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, "")), (character) => character.charCodeAt(0));
      return new TextDecoder("utf-8").decode(bytes);
    } catch (apiError) {
      console.error(`[portfolio] README could not be loaded for ${name}.`, { rawError, apiError });
      return "Bu proje için README içeriği alınamadı.";
    }
  }
}

async function release(name) {
  try { const releases = await api(`${base}/repos/${siteConfig.githubUsername}/${name}/releases`); return releases.flatMap((releaseItem) => releaseItem.assets || [])[0] || null; } catch { return null; }
}

async function openProject(name) {
  const project = projects.find((item) => item.repo === name);
  const article = project?.articleId && articles.find((item) => item.id === project.articleId);
  content.innerHTML = "<p>Proje bilgileri yükleniyor...</p>";
  dialog.showModal();
  const [repository, readmeText, asset] = await Promise.all([repo(name), readme(name), release(name)]);
  const readmeBaseUrl = `https://github.com/${siteConfig.githubUsername}/${name}/blob/HEAD/`;
  content.innerHTML = `<p class="eyebrow">${esc(repository?.language || "GitHub repository")}</p><h2>${esc(project?.title || repository?.name || name)}</h2><p>${esc(project?.summary || repository?.description || "")}</p><div class="tabs"><button class="tab active" data-tab="readme" type="button">README</button>${article ? '<button class="tab" data-tab="article" type="button">Article</button>' : ""}</div><section class="panel active" data-panel="readme">${md(readmeText, readmeBaseUrl)}</section>${article ? `<section class="panel" data-panel="article">${md(article.content)}</section>` : ""}<div class="actions bottom">${asset ? `<a class="button primary" href="${esc(asset.browser_download_url)}">İndir: ${esc(asset.name)}</a>` : ""}<a class="button" href="${esc(repository?.html_url || `https://github.com/${siteConfig.githubUsername}/${name}`)}" target="_blank" rel="noreferrer">GitHub'da aç ↗</a></div>`;
  content.querySelectorAll(".tab").forEach((tab) => { tab.onclick = () => { content.querySelectorAll(".tab,.panel").forEach((item) => item.classList.remove("active")); tab.classList.add("active"); content.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add("active"); }; });
}

function openArticle(id) {
  const article = articles.find((item) => item.id === id);
  content.innerHTML = `<p class="eyebrow">${esc(article.date)} · ${esc(article.readingTime)}</p><h2>${esc(article.title)}</h2><div class="article-body">${md(article.content)}</div>`;
  dialog.showModal();
}

document.querySelector("#close").onclick = () => dialog.close();
dialog.onclick = (event) => { if (event.target === dialog) dialog.close(); };
document.querySelector("#year").textContent = new Date().getFullYear();
document.querySelectorAll("[data-config]").forEach((element) => { element.textContent = siteConfig[element.dataset.config]; });
document.querySelectorAll("[data-link]").forEach((element) => {
  const links = { github: siteConfig.githubProfileUrl, linkedin: siteConfig.linkedinUrl, instagram: siteConfig.instagramUrl };
  element.href = links[element.dataset.link] || "#";
});
document.querySelectorAll("[data-email]").forEach((element) => { element.href = `mailto:${siteConfig.email}`; });

const savedTheme = localStorage.getItem("theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
document.querySelector("#theme").onclick = () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
};
document.querySelector("#menu").onclick = () => document.querySelector("#links").classList.toggle("open");
renderProjects();
renderArticles();
