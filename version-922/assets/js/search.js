(function () {
  const movies = Array.isArray(window.STATIC_MOVIES) ? window.STATIC_MOVIES : [];
  const form = document.getElementById('siteSearchForm');
  const input = document.getElementById('siteSearchInput');
  const results = document.getElementById('searchResults');
  const status = document.getElementById('searchStatus');

  if (!form || !input || !results || !status) {
    return;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    const tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-link" href="' + escapeHtml(movie.link) + '">' +
        '<div class="poster">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-type">' + escapeHtml(movie.type) + '</span>' +
          '<span class="poster-year">' + escapeHtml(movie.year) + '</span>' +
        '</div>' +
      '</a>' +
      '<div class="card-body">' +
        '<h3><a href="' + escapeHtml(movie.link) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="card-meta">' +
          '<a href="' + escapeHtml(movie.categoryLink) + '">' + escapeHtml(movie.category) + '</a>' +
          '<span>' + escapeHtml(movie.region) + '</span>' +
          '<span>' + escapeHtml(movie.genre) + '</span>' +
        '</div>' +
        '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
    '</article>';
  }

  function runSearch(query) {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      const hot = movies.slice(0, 20);
      results.innerHTML = hot.map(card).join('');
      status.textContent = '热门影片';
      return;
    }

    const matched = movies.filter(function (movie) {
      const haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.tags.join(' '),
        movie.oneLine
      ].join(' ').toLowerCase();
      return haystack.includes(keyword);
    }).slice(0, 120);

    results.innerHTML = matched.map(card).join('');
    status.textContent = matched.length ? '搜索到 ' + matched.length + ' 条相关影片' : '未找到相关影片';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set('q', input.value.trim());
    window.history.replaceState({}, '', url.toString());
    runSearch(input.value);
  });

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  input.value = initialQuery;
  runSearch(initialQuery);
})();
