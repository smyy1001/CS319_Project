import React, { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Axios from "../../Axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-calendar/dist/Calendar.css"; // Import CSS for the calendar
import "./Guides.css";
import Guide from "../../Components/GuideCard/GuideCard";
import GuideDetailCard from "../../Components/GuideDetailCard/GuideDetailCard";
import GuideTourCard from "../../Components/GuideTourCard/GuideTourCard";
import AdvisorCard from "../../Components/AdvisorCard/AdvisorCard";
import AdvisorDetailCard from "../../Components/AdvisorDetailCard/AdvisorDetailCard";

const Guides = ({ role }) => {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [tours, setTours] = useState([]);
  const [guideTours, setGuideTours] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null); // General state for both Guide and Advisor
  const [selectedGuideTours, setSelectedGuideTours] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [advisors, setAdvisors] = useState([]);
  const [filteredAdvisors, setFilteredAdvisors] = useState([]);

  const fetchGuides = async () => {
    try {
      const response = await Axios.get("/api/guides/all");
      setGuides(response.data);
      setFilteredGuides(response.data);
    } catch (err) {
      setError("Failed to fetch guides. Please try again later.");
    }
  };

  const fetchAdvisors = async () => {
    try {
      const response = await Axios.get("/api/advisors/all");
      setAdvisors(response.data);
      setFilteredAdvisors(response.data);
    } catch (err) {
      console.error("Failed to fetch advisors.", err);
    }
  };

  const fetchTours = async () => {
    try {
      const response = await Axios.get("/api/tours/all");
      setTours(response.data);
    } catch (err) {
      console.error("Failed to fetch tours.", err);
    }
  };

  const fetchGuideTours = async () => {
    try {
      const response = await Axios.get("/api/guides_tour/all");
      setGuideTours(response.data);
    } catch (err) {
      console.error("Failed to fetch guide-tour relationships.", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchGuides(),
      fetchTours(),
      fetchGuideTours(),
      fetchAdvisors(),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchSelectedGuideTours = async (guideId) => {
    try {
      const [assignedResponse, requestedResponse] = await Promise.all([
        Axios.get(`/api/guides_tour/show_guide_assigns/${guideId}/`),
        Axios.get(`/api/guides_tour/show_guide_requests/${guideId}/`),
      ]);
      const combinedTours = [
        ...assignedResponse.data,
        ...requestedResponse.data,
      ];
      setSelectedGuideTours(combinedTours);
    } catch (err) {
      console.error("Failed to fetch guide's tours:", err);
    }
  };

  const handlePersonClick = (person) => {
    if (person.responsible_day) {
      // Responsible day varsa Advisor'dır
      setSelectedPerson({ ...person, type: "advisor" });
    } else {
      // Responsible day yoksa Guide'dır
      setSelectedPerson({ ...person, type: "guide" });
      fetchSelectedGuideTours(person.id);
    }
  };

  const handleBack = () => {
    setSelectedPerson(null);
    setSelectedGuideTours([]);
  };

  const toggleSearchBar = () => {
    setSearchActive(!searchActive);
    setSearchQuery("");
    setFilteredGuides(guides);
    setFilteredAdvisors(advisors);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filteredGuides = guides.filter((guide) =>
      guide.name.toLowerCase().includes(query)
    );

    const filteredAdvisors = advisors.filter((advisor) =>
      advisor.name.toLowerCase().includes(query)
    );

    setFilteredGuides(filteredGuides);
    setFilteredAdvisors(filteredAdvisors);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="main-container">
      <div className="left_container">
        <div className="header-with-search">
          <div className="search_icon">
            <SearchIcon
              size={20}
              style={{ cursor: "pointer", marginLeft: "10px" }}
              onClick={toggleSearchBar}
            />
          </div>

          {searchActive ? (
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rehber veya Advisor ara..."
              className="search-bar"
            />
          ) : (
            <h2
              style={{
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              Rehberler ve Advisorlar
            </h2>
          )}
        </div>
        <hr className="custom-line" />
        {selectedPerson ? (
          selectedPerson.type === "advisor" ? (
            <AdvisorDetailCard advisor={selectedPerson} onBack={handleBack} />
          ) : (
            <GuideDetailCard
              setSelectedGuide={setSelectedPerson}
              role={role}
              fetchGuides={fetchGuides}
              guide={selectedPerson}
              onBack={handleBack}
            />
          )
        ) : (
          <div>
            {filteredGuides.map((guide, index) => (
              <Guide
                key={index}
                guide={guide}
                onActionClick={() => handlePersonClick(guide)}
              />
            ))}
            {filteredAdvisors.map((advisor, index) => (
              <AdvisorCard
                key={index}
                advisor={advisor}
                onActionClick={() => handlePersonClick(advisor)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="right_container">
        <h2
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          {selectedPerson
            ? `${selectedPerson.name} ${
                selectedPerson.type === "advisor"
                  ? "Advisor Görevleri"
                  : "Rehberinin Turları"
              }`
            : "Tüm Rehberlerin Turları"}
        </h2>
        <hr className="custom-line" />
        <div>
          {selectedPerson && selectedPerson.type === "guide" ? (
            selectedGuideTours.length > 0 ? (
              selectedGuideTours.map((tour, index) => (
                <GuideTourCard
                  key={index}
                  guide={selectedPerson}
                  tour={tour}
                  status={tour.status}
                />
              ))
            ) : (
              <p>Bu rehberin tur kaydı bulunmamaktadır.</p>
            )
          ) : guideTours.length > 0 ? (
            guideTours.map((item, index) => {
              const guide = guides.find((g) => g.id === item.guide_id);
              const tour = tours.find((t) => t.id === item.tour_id);

              if (!guide || !tour) {
                return null;
              }

              return (
                <GuideTourCard
                  key={index}
                  guide={guide}
                  tour={tour}
                  status={item.status}
                />
              );
            })
          ) : (
            <p>Henüz rehber-tur ilişkisi bulunmamaktadır.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Guides;
