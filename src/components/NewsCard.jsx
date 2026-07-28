// src/components/NewsCard.jsx

function NewsCard({ item }) {
  const date = new Date(item.date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return (
    <div className="news-card">
      <img className="news-card__image" src={item.image} alt={item.title} />
      <div className="news-card__body">
        <span className="news-card__date">{date}</span>
        <span className="info-card__title" style={{ fontSize: '1rem' }}>
          {item.title}
        </span>
        <p className="info-card__desc">{item.summary}</p>
      </div>
    </div>
  );
}

export default NewsCard;
