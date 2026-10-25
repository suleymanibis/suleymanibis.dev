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

GitHub REST API pinned repository listesini herkese açık biçimde sağlamadığı için site `generated/pinned-projects.js` dosyasını kullanır. Bu dosya, GitHub Actions'taki `sync-pinned-repos.yml` workflow'u tarafından her gün GraphQL API ve Actions'ın geçici `GITHUB_TOKEN` yetkisiyle güncellenir. Token hiçbir zaman site JavaScript'ine veya build çıktısına yazılmaz. Pinned repo değişiklikleri workflow'un commit'i ve Pages deploy'u sonrasında otomatik görünür.

`config.js` içindeki `manualProjects` pinned verisinin metadata fallback'idir: yerel geliştirmede veya senkron workflow'u henüz çalışmadığında başlık, Türkçe özet, etiket ve Article eşlemesi sağlar. Yeni bir repo pinlendiğinde metadata'sını bu listeye eklemek isteğe bağlıdır; repo generated dosyada görünür, ancak özel başlık/özet/Article bağlantısı için config'e de eklenebilir. README içeriği önce rate limit gerektirmeyen `raw.githubusercontent.com` endpoint'inden, başarısız olursa public GitHub REST API'den yüklenir. README yükleme hataları tarayıcı konsoluna açıkça yazılır ve kullanıcıya Türkçe fallback mesajı gösterilir. Release assetleri proje detayında public GitHub REST API'den yüklenir.

## Article ekleme

`articles.js` içindeki `articles` dizisine `id`, `title`, `date`, `readingTime`, `excerpt` ve `content` alanları olan bir nesne ekleyin. Bir makaleyi proje detayındaki README/Article sekmesine bağlamak için ilgili `manualProjects` girdisine aynı `articleId` değerini ekleyin. Desteklenen Markdown: başlık, paragraf, liste, kalın metin ve inline code.

## GitHub Pages ve özel alan adı

1. Repository ayarlarında **Pages > Build and deployment > Source: GitHub Actions** seçin.
2. `main` branch'ine yapılan her push `.github/workflows/pages.yml` workflow'unu çalıştırır.
3. `CNAME` dosyası `suleymanibis.dev` alan adını içerir; farklı alan adı için güncelleyin.
4. DNS sağlayıcınızda apex domain için GitHub Pages'in güncel A kayıtlarını, `www` için GitHub Pages CNAME kaydını kullanın.
5. GitHub Pages ayarlarında HTTPS zorlamasını etkinleştirin.

Site herhangi bir secret veya GitHub token kullanmaz; public API çağrıları tarayıcıdan yapılır. API rate limit'i aşılırsa manuel proje başlıkları ve içerikleri görünmeye devam eder.
