export const articles = [{
  id: "building-this-site",
  title: "Build gerektirmeyen bir portfolyo sitesi",
  date: "25 Ekim 2026",
  readingTime: "4 dk okuma",
  excerpt: "GitHub Pages üzerinde sade, hızlı ve kolay güncellenebilir bir kişisel site kurarken izlediğim yol.",
  content: `## Neden statik?

Kişisel bir sitenin her zaman bir backend'e ihtiyacı yok. HTML, CSS ve modern JavaScript ile kurulan küçük bir uygulama hızlı açılır, kolayca versiyonlanır ve GitHub Pages üzerinde doğrudan yayınlanır.

Bu sitede ayarları \`config.js\` içinde, içerikleri ise \`articles.js\` içinde tutuyorum. Yeni bir makale eklemek için veritabanı ya da CMS kurmaya gerek yok.

## GitHub ile canlı veri

Proje kartları herkese açık GitHub REST API'sini kullanır. README ve release assetleri yalnızca kullanıcı kartı açıldığında istenir. Pinned repository listesi REST API'de bulunmadığı için profil pin'lerini merkezi manuel listeyle eşliyorum.

## Sonuç

Küçük yüzey alanı, kolay bakım ve iyi bir kullanıcı deneyimi.`
}];
