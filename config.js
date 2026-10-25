export const siteConfig = {
  githubUsername: "suleymanibis",
  githubProfileUrl: "https://github.com/suleymanibis",
  linkedinUrl: "https://www.linkedin.com/",
  email: "hello@suleymanibis.dev",
  intro: "Ürün odaklı yazılım geliştiriyor, açık kaynak projeler üretiyor ve öğrendiklerimi paylaşıyorum.",
  about: "Karmaşık problemleri sadeleştirmeyi, iyi dokümante edilmiş sistemler kurmayı ve öğrendiklerimi paylaşmayı seviyorum. Frontend deneyimleri, geliştirici araçları ve üretken yapay zekâ kesişiminde çalışıyorum.",
  // GitHub REST API pinned repository listesini döndürmediği için bu liste profil
  // pin sırasıyla senkron tutulur. Yeni pin eklenince yalnızca bu diziyi güncelleyin.
  manualProjects: [
    { repo: "commerce-cart-api-java", title: "Commerce Cart API", summary: "E-ticaret sitelerinin backend'ini simüle eden Java tabanlı API projesi.", tags: ["Java", "API"], accent: "blue" },
    { repo: "commerce-cart-api-ui-csharp", title: "Commerce Cart API UI", summary: "E-ticaret API'sini kullanan C# .NET WinForms uygulaması.", tags: ["C#", ".NET"], accent: "coral" },
    { repo: "commerce-cart-api-client-python", title: "Commerce Cart API Client", summary: "E-ticaret API'siyle çalışan Python CLI uygulaması.", tags: ["Python", "CLI"], accent: "blue" },
    { repo: "credit-card-validator-java", title: "Credit Card Validator", summary: "Kredi kartı numaralarını doğrulayan sade Java uygulaması.", tags: ["Java", "Validation"], accent: "coral" },
    { repo: "mastermind-game-java", title: "Mastermind Game", summary: "Java ile geliştirilmiş klasik Mastermind oyunu.", tags: ["Java", "Game"], accent: "blue" }
  ]
};
