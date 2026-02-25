// キャッシュの名前（更新時にバージョンを変えると新しいキャッシュが作られます）
var CACHE_NAME = 'papanshiki-v2';
var urlsToCache = [
  // === トップページ ===
  './',
  './index.html',
  './manifest.json',

  // === アイコン・小画像 ===
  './icon-192.webp',
  './icon-512.webp',
  './player.webp',
  './pippi192.webp',
  './an192.webp',
  './hi-192.webp',
  './hi-an-192.webp',
  './hi-an-suisai-192.webp',
  './hi-kagaku-410.webp',
  './hari-an.webp',
  './hari-an-zannen.webp',

  // === 算数・数学系 ===
  './sansuu.html',
  './math.html',
  './math2.html',
  './math100.html',
  './99.html',
  './hissan.html',
  './flash.html',
  './flash_anzan.html',
  './count30.html',
  './make10.html',
  './triangle.html',
  './numbers.html',
  './search_count.html',

  // === 100マス計算 ===
  './100home.html',
  './100blue.html',
  './100green.html',
  './100orange.html',
  './100orangekai.html',
  './100pink.html',
  './100yellow.html',

  // === 国語系 ===
  './youji.html',
  './1gradekanji.html',
  './1nenkanji.html',
  './katakana.html',
  './bunsho.html',
  './kanji_dungeon_2grade.html',

  // === 漢字・文法学習 ===
  './kanji_learn.html',
  './kanji/grade1.js',
  './kanji/grade2.js',
  './bunpo_learn.html',

  // === 分数学習・小数学習・割り算・割合 ===
  './bunsu_learn.html',
  './shousu_learn.html',
  './warizan_learn.html',
  './wariai_learn.html',
  './job_learn.html',

  // === 英語系 ===
  './alphabet.html',
  './alphabet_read.html',
  './english_profile.html',
  './english_talk.html',
  './english_talk2.html',
  './daily_english.html',
  './romaji_quiz.html',
  './print_romaji.html',

  // === 理科 ===
  './science.html',
  './human_model.html',
  './color_lab.html',
  './water.html',

  // === 音楽 ===
  './music_class.html',
  './pitch.html',
  './rhythm.html',

  // === ゲーム・エンタメ ===
  './detective.html',
  './dungeon.html',
  './rain.html',
  './rain_romaji.html',
  './rain_vowel.html',
  './kyorokyoro.html',
  './star_puzzle.html',
  './tsumitsumi.html',
  './burger_shop.html',
  './memory.html',
  './rail.html',
  './rail2.html',
  './gacha.html',
  './addiction.html',

  // === 生活・社会 ===
  './whattime.html',
  './calendar.html',
  './shopping.html',
  './interest.html',
  './stock.html',
  './about_stock.html',
  './bank.html',

  // === プリント ===
  './print_alphabet.html',
  './print_kana.html',

  // === その他ページ ===
  './programming.html',
  './record.html',
  './open_record.html',
  './backup.html',
  './privacy.html',
  './room.html',
  './room_list.html',
  './room_shop.html',
  './avatar_shop.html',

  // === ブログ ===
  './blog/index.html',
  './blog/article001.html',
  './blog/article002.html',
  './blog/article003.html',
  './blog/header_h200.webp',

  // === 裏ページ ===
  './ura/secret_home.html',
  './ura/sheep_stable.html',
  './ura/sheep_race.html',
  './ura/sheep_stable_race.html',
  './ura/chinchiro.html',
  './ura/highlow.html',

  // === JS・CSS ===
  './ranking.js',
  './firebase-ranking.js',
  './css/human_model.css',
  './js/human_model.js',

  // === 音声ファイル ===
  './se/A4.mp3',
  './se/B4.mp3',
  './se/C4.mp3',
  './se/D4.mp3',
  './se/E4.mp3',
  './se/F4.mp3',
  './se/G4.mp3',
  './se/attack.mp3',
  './se/clear.mp3',
  './se/damage.mp3',

  // === バーガーショップSVG ===
  './image/bug_lettuce.svg',
  './image/burger_bun_bottom.svg',
  './image/burger_bun_top.svg',
  './image/burger_cheese.svg',
  './image/burger_lettuce.svg',
  './image/burger_meat_cooked.svg',
  './image/burger_meat_raw.svg',
  './image/burger_tomato.svg',
  './image/burger_trash.svg',
  './image/burnt_bun.svg',
  './image/robot_arm.svg',

  // === 臓器画像（人体模型用） ===
  './organ/body.webp',
  './organ/daicho.webp',
  './organ/hai.webp',
  './organ/i.webp',
  './organ/jinzo.webp',
  './organ/kanzo.webp',
  './organ/shinzo.webp',
  './organ/shocho.webp',
  './organ/suizo.webp'
];

// インストール処理
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// ★ここが変更点：通信時の処理（ネットワーク優先）
self.addEventListener('fetch', function (event) {
  // 重要: chrome-extension:// や file:// など、http(s)以外のリクエストは
  // Service Workerで扱わず、ブラウザの標準挙動に任せる
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    // まずネットワーク(最新)を取りに行く
    fetch(event.request)
      .then(function (response) {
        // 成功したらキャッシュにも保存して、その最新データを返す
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // ここに来るのは http(s) の success レスポンスのみ
        var responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(function (cache) {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(function () {
        // ネットワークが繋がらない時だけ、保存したキャッシュを使う
        return caches.match(event.request);
      })
  );
});