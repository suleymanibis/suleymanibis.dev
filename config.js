export const siteConfig = {
  githubUsername: "suleymanibis",
  githubProfileUrl: "https://github.com/suleymanibis",
  linkedinUrl: "https://www.linkedin.com/",
  instagramUrl: "https://instagram.com/suleymanibis1",
  email: "ibiss.suleymann@gmail.com",
  intro: "Akdeniz Üniversitesi'nde bilgisayar mühendisliği öğrencisiyim. Yazılım geliştirme ve backend sistemleriyle ilgileniyor; Java, Python ve C# ile projeler geliştiriyorum.",
  about: "Backend çözümleri geliştiriyor, Java ile aktif olarak çalışıyorum. Aynı zamanda client-side Python uygulamalarını ve C# ile kullanıcı arayüzü projelerini keşfediyorum. REST API'ler, CLI ve UI uygulamaları, Spring Boot, Hibernate, .NET ve PostgreSQL ilgi alanlarım arasında.",
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
