// src/Pages/NewsPage.jsx
import { useEffect, useState } from 'react';
import { catalog } from '../api/mockApi';
import NewsCard from '../components/NewsCard';

function NewsPage() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    catalog.listNews().then(setNews);
  }, []);

  return (
    <div>
      <div className="content__header">
        <h1 className="content__title">Noticias</h1>
      </div>
      <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {news.map((n) => (
          <NewsCard key={n.id} item={n} />
        ))}
      </div>
    </div>
  );
}

export default NewsPage;
