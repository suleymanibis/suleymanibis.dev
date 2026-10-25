import { siteConfig } from "./config.js";
import { articles } from "./articles.js";

const base = "https://api.github.com";
const grid = document.querySelector("#project-grid");
const articlesGrid = document.querySelector("#article-grid");
const dialog = document.querySelector("#dialog");
const content = document.querySelector("#dialog-content");

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[c]));

function md(s = "") {
  return s.replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .replace(/(?:<li>.*<\/li>\n?)+/g, (x) => `<ul>${x}</ul>`)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .split(/\n{2,}/).map((x) => /^(<h|<ul)/.test(x.trim()) ? x : `<p>${x.replace(/\n/g, "<br>")}</p>`).join("");
}

async function api(url) {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!response.ok) throw Error(response.status);
  return response.json();
}

async function repo(name) {
  try { return await api(`${base}/repos/${siteConfig.githubUsername}/${name}`); } catch { return null; }
}

function card(project, repository) {
  const title = project.title || repository?.name || project.repo;
  const description = project.summary || repository?.description || "GitHub üzerinde yayınlanan bir proje.";
  const tags = project.tags || [repository?.language].filter(Boolean);
  return `<article class="card accent-${esc(project.accent || "blue")}"><div class="card-top"><b>${esc(project.repo.slice(0, 2).toUpperCase())}</b><a href="${esc(repository?.html_url || `https://github.com/${siteConfig.githubUsername}/${project.repo}`)}" target="_blank" rel="noreferrer" aria-label="${esc(title)} GitHub'da aç">↗</a></div><div><small>${esc(repository?.language || tags[0] || "Proje")}</small><h3>${esc(title)}</h3><p>${esc(description)}</p></div><div class="tags">${tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div><button class="read" data-repo="${esc(project.repo)}" type="button">Detayları gör →</button></article>`;
}

async function renderProjects() {
  const data = await Promise.all(siteConfig.manualProjects.map(async (project) => ({ project, repository: await repo(project.repo) })));
  grid.innerHTML = data.map(({ project, repository }) => card(project, repository)).join("");
  grid.querySelectorAll("[data-repo]").forEach((button) => { button.onclick = () => openProject(button.dataset.repo); });
}

function renderArticles() {
  articlesGrid.innerHTML = articles.map((article, index) => `<article class="card article"><div class="meta">0${index + 1} · ${esc(article.date)} · ${esc(article.readingTime)}</div><h3>${esc(article.title)}</h3><p>${esc(article.excerpt)}</p><button class="read" data-article="${esc(article.id)}" type="button">Makaleyi oku →</button></article>`).join("");
  articlesGrid.querySelectorAll("[data-article]").forEach((button) => { button.onclick = () => openArticle(button.dataset.article); });
}

async function readme(name) {
  try { const data = await api(`${base}/repos/${siteConfig.githubUsername}/${name}/readme`); return atob(data.content.replace(/\n/g, "")); } catch { return "Bu proje için README içeriği alınamadı."; }
}

async function release(name) {
  try { const releases = await api(`${base}/repos/${siteConfig.githubUsername}/${name}/releases`); return releases.flatMap((releaseItem) => releaseItem.assets || [])[0] || null; } catch { return null; }
}

async function openProject(name) {
  const project = siteConfig.manualProjects.find((item) => item.repo === name);
  const article = project?.articleId && articles.find((item) => item.id === project.articleId);
  content.innerHTML = "<p>Proje bilgileri yükleniyor...</p>";
  dialog.showModal();
  const [repository, readmeText, asset] = await Promise.all([repo(name), readme(name), release(name)]);
  content.innerHTML = `<p class="eyebrow">${esc(repository?.language || "GitHub repository")}</p><h2>${esc(project?.title || repository?.name || name)}</h2><p>${esc(project?.summary || repository?.description || "")}</p><div class="tabs"><button class="tab active" data-tab="readme" type="button">README</button>${article ? '<button class="tab" data-tab="article" type="button">Article</button>' : ""}</div><section class="panel active" data-panel="readme">${md(esc(readmeText))}</section>${article ? `<section class="panel" data-panel="article">${md(article.content)}</section>` : ""}<div class="actions bottom">${asset ? `<a class="button primary" href="${esc(asset.browser_download_url)}">İndir: ${esc(asset.name)}</a>` : ""}<a class="button" href="${esc(repository?.html_url || `https://github.com/${siteConfig.githubUsername}/${name}`)}" target="_blank" rel="noreferrer">GitHub'da aç ↗</a></div>`;
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
document.querySelectorAll("[data-link]").forEach((element) => { element.href = element.dataset.link === "github" ? siteConfig.githubProfileUrl : siteConfig.linkedinUrl; });
document.querySelector("[data-email]").href = `mailto:${siteConfig.email}`;

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
