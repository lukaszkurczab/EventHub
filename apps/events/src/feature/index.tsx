import styles from "./styles.css";
import { events } from "./events";

export default function EventCatalog() {
  return (
    <>
      <style>{styles}</style>
      <p className="eyebrow">This weekend and beyond</p>
      <h1>Find your next great gathering.</h1>
      <div className="grid">
        {events.map((event) => (
          <article key={event.title}>
            <time>{event.date}</time>
            <h2>{event.title}</h2>
            <p>{event.place}</p>
            <button>Reserve a spot</button>
          </article>
        ))}
      </div>
    </>
  );
}
