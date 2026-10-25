# suleymanibis.dev

GitHub profilindeki sabitli projeleri, proje README'lerini, release assetlerini ve kişisel Articles içeriklerini gösteren build gerektirmeyen portfolyo sitesi.

## Yerelde çalıştırma

ES module import'larının çalışması için bir HTTP sunucusu kullanın:

```bash
python -m http.server 8000
```

Ardından `http://localhost:8000` adresini açın.

## Repository ve profil ayarları

Tüm kişisel ayarlar `config.js` içindedir: `githubUsername`, profil bağlantıları, e-posta metinleri ve `manualProjects` listesi. Her proje girdisindeki `repo`, GitHub repository adıyla aynı olmalıdır. Başlık, özet, etiketler ve ilişkilendirilecek `articleId` de buradan düzenlenir.

GitHub REST API pinned repository listesini herkese açık biçimde sağlamadığı için site pinned repoları `manualProjects` listesinden alır. Her repository'nin güncel adı, dili, açıklaması, README'si ve release assetleri public GitHub API'den yüklenir. API erişilemezse kartlar manuel ayarlarla çalışmaya devam eder; README alınamazsa kullanıcıya durum mesajı gösterilir.

## Article ekleme

`articles.js` içindeki `articles` dizisine `id`, `title`, `date`, `readingTime`, `excerpt` ve `content` alanları olan bir nesne ekleyin. Bir makaleyi proje detayındaki README/Article sekmesine bağlamak için ilgili `manualProjects` girdisine aynı `articleId` değerini ekleyin. Desteklenen Markdown: başlık, paragraf, liste, kalın metin ve inline code.

## GitHub Pages ve özel alan adı

1. Repository ayarlarında **Pages > Build and deployment > Source: GitHub Actions** seçin.
2. `main` branch'ine yapılan her push `.github/workflows/pages.yml` workflow'unu çalıştırır.
3. `CNAME` dosyası `suleymanibis.dev` alan adını içerir; farklı alan adı için güncelleyin.
4. DNS sağlayıcınızda apex domain için GitHub Pages'in güncel A kayıtlarını, `www` için GitHub Pages CNAME kaydını kullanın.
5. GitHub Pages ayarlarında HTTPS zorlamasını etkinleştirin.

Site herhangi bir secret veya GitHub token kullanmaz; public API çağrıları tarayıcıdan yapılır. API rate limit'i aşılırsa manuel proje başlıkları ve içerikleri görünmeye devam eder.
