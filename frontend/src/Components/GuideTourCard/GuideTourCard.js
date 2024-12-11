import React from "react";
import "./GuideTourCard.css"; // Stil dosyası

const GuideTourCard = ({ guide, tour, status }) => {
  return (
    <div className="guide-tour-card">
      <div className="guide-tour-left">
        <img
          src={"https://picsum.photos/200/300"}
          alt={guide.name}
          className="guide-tour-image"
        />
      </div>
      <div className="guide-tour-right">
        <h3
          style={{
            fontWeight: "bold",
          }}
        >
          {guide.name}
        </h3>
        <p>
          <strong>Tur:</strong> {tour.high_school_name} ({tour.city})
        </p>
        <p>
          <strong>Tarih:</strong> {new Date(tour.date).toLocaleDateString()}
        </p>
        <p>
          <strong>Saat:</strong>{" "}
          {new Date(tour.date).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>{" "}
        <p>
          <strong>Durum:</strong>{" "}
          {status === "ASSIGNED" ? "Atandı" : "Talep Edildi"}
        </p>
      </div>
    </div>
  );
};

export default GuideTourCard;
