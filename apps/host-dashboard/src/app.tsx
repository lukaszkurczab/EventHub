import React from "react";
import "./styles.css";
const metrics = [
  { label: "Upcoming events", value: "4" },
  { label: "Reservations", value: "286" },
  { label: "Response rate", value: "94%" },
];
export default function HostDashboard() {
  return (
    <>
      <p className="eyebrow">Host workspace</p>
      <h1>Good afternoon, Alex.</h1>
      <section>
        {metrics.map((metric) => (
          <article key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </section>
      <div className="next">
        <div>
          <p className="eyebrow">Next event</p>
          <h2>Product People Breakfast</h2>
          <p>Thursday, 09:00 · 68 of 80 seats reserved</p>
        </div>
        <button>Manage event</button>
      </div>
    </>
  );
}
