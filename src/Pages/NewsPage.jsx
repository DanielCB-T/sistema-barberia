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
      <div className="card-grid card-grid--news">
        {news.map((n) => (
          <NewsCard key={n.id} item={n} />
        ))}
      </div>
    </div>
  );
}

export default NewsPage;
