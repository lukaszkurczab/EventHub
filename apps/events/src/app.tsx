import React from "react";
import "./styles.css";

const events = [
  { date: "18 Jul", title: "Design Systems Meetup", place: "Warsaw" },
  { date: "24 Jul", title: "Sustainable Cities Forum", place: "Kraków" },
  { date: "02 Aug", title: "Indie Makers Night", place: "Gdańsk" },
];
export default function EventCatalog() {
  return (
    <>
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
