import React, { useState, useEffect } from "react";
import TourCard from "../../Components/TourCard/TourCard";
import Container from "@mui/material/Container";
import Axios from '../../Axios';
import { Tooltip } from "@mui/material";
import './Tours.css';

// calender
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);


function Tours({role}) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const [tours, setTours] = useState([]);
    const [respAdvisors, setRespAdvisors] = useState([]);
    const [chosenTour, setChosenTour] = useState(null);
    const [updateGuides, setUpdateGuides] = useState(false);
    // const [pending_tours, setPendingTours] = useState([]);


    const events = tours
        .filter((tour) => tour.confirmation === 'BTO ONAY')
        .map((tour) => {
            return {
                start: new Date(tour.date),
                end: new Date(tour.date),
                title: tour.high_school_name + " / " + tour.teacher_name,
            };
        });
     
    useEffect(() => {
        Axios.get('/api/tours/all')
            .then((response) => {
                setTours(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

        Axios.get('/api/advisors/all')
            .then((response) => {
                const responsibleAdvisors = response.data.filter(advisor => {
                    return advisor.responsible_day && advisor.responsible_day.includes(today);
                });
                setRespAdvisors(responsibleAdvisors);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [today]);



    return (
        <Container className="tours-main-container">
            <div className="tours-content">

                {/* LEFT CONT*/}
                <div className="tours-left-cont">
                    <div className="tours-management-cont">

                        <div className="tours-management-cont header">
                            <Tooltip title='Listeye geri dön'>
                                <div onClick={() => { setChosenTour(null); setUpdateGuides(false); }}>
                                    Turlar
                                </div>
                            </Tooltip>
                        </div>

                        <div className="tours-management-cont list">
                            <TourCard role={role}  tours={tours} setChosenTour={setChosenTour} chosenTour={chosenTour} setUpdateGuides={setUpdateGuides} updateGuides={updateGuides}/>
                        </div>
                    </div>
                </div>


                {/* RIGHT CONT */}
                <div className="tours-right-cont">
                    <div className="tours-calender-cont">

                        <div className="tours-calender-cont calender">
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                            />
                        </div>

                        <div className="tours-calender-cont advisor-panel">
                            {respAdvisors.length === 0 ? (
                                <p>No advisors responsible for today.</p>
                            ) : (
                                respAdvisors.map((advisor, index) => (
                                    <div key={index} className="tours-calender-cont advisor-panel detail">
                                        <div className="advisor-detail-format">
                                            <div style={{ fontWeight: 'bold', marginRight: '5px' }}>Gün:</div>
                                            <div>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                        </div>
                                        <div className="advisor-detail-format">
                                            <div className="advisor-detail-format2">Sorumlu:</div>
                                            <div>{advisor.name}</div>
                                        </div>
                                        <div className="advisor-detail-format">
                                            <div className="advisor-detail-format2">Tel. No:</div>
                                            <div>{advisor.phone}</div>
                                        </div>
                                        <div className="advisor-detail-format">
                                            <div className="advisor-detail-format2">E-Posta:</div>
                                            <div>{advisor.email}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </Container>
    );
}

export default Tours;