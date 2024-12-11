import React, { useState, useEffect } from "react";
import FairCard from "../../Components/FairCard/FairCard";
import Container from "@mui/material/Container";
import Axios from '../../Axios';
import { Tooltip } from "@mui/material";
import './Fairs.css';

// calender
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function Fairs({role}) {
    const days = [
        'Sunday', 
        'Monday', 
        'Tuesday', 
        'Wednesday', 
        'Thursday', 
        'Friday', 
        'Saturday'
    ];
    const today = days[new Date().getDay()];
    const [fairs, setFairs] = useState([]);
    const [respAdvisors, setRespAdvisors] = useState([]);
    const [chosenFair, setChosenFair] = useState(null);
    const [updateGuides, setUpdateGuides] = useState(false);
    // const [pending_fairs, setPendingfairs] = useState([]);

    const events = fairs
    .filter((fair) => fair.confirmation === 'BTO ONAY')
    .map((fair) => {
        return {
            start: new Date(fair.date),
            end: new Date(fair.date),
            title: fair.high_school_name
        };
    });
        
    useEffect(() => {
        Axios.get('/api/fairs/all')
            .then((response) => {
                    setFairs(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

        Axios.get('/api/advisors/all')
            .then((response) => {
                const responsibleAdvisors = response.data.filter(advisor => {
                    return( 
                    advisor.responsible_day && advisor.responsible_day.includes(today)
                    );
                });
                setRespAdvisors(responsibleAdvisors);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [today]);

    return (
        <Container className="fairs-main-container">
            <div className="fairs-content">
                {/* LEFT CONT*/}
                <div className="fairs-left-cont">
                    <div className="fairs-management-cont">
                        <div className="fairs-management-cont header">
                            <Tooltip title='Listeye geri dön'>
                                <div 
                                onClick={() => { 
                                    setChosenFair(null); 
                                    setUpdateGuides(false); 
                                    }}
                                    >
                                    Fuarlar
                                </div>
                            </Tooltip>
                        </div>

                        <div className="fairs-management-cont list">
                            <FairCard 
                            role={role}  
                            fairs={fairs} 
                            setFairs = {setFairs}
                            setChosenFair={setChosenFair} 
                            chosenFair={chosenFair} 
                            setUpdateGuides={setUpdateGuides} 
                            updateGuides={updateGuides}
                            /> 
                        </div>
                    </div>
                </div>

                {/* RIGHT CONT */}
                <div className="fairs-right-cont">
                    <div className="fairs-calender-cont">
                        <div className="fairs-calender-cont calender">
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                            />
                        </div>

                        <div className="fairs-calender-cont advisor-panel">
                            {respAdvisors.length === 0 ? (
                                <p>No advisors responsible for today.</p>
                            ) : (
                                respAdvisors.map((advisor, index) => (
                                    <div 
                                    key={index} 
                                    className="fairs-calender-cont advisor-panel detail"
                                    >
                                        <div className="advisor-detail-format">
                                            <div style={{ fontWeight: 'bold', marginRight: '5px' }}>
                                                Gün:</div>
                                            <div>
                                                {new Date().toLocaleDateString('tr-TR', { 
                                                    day: 'numeric', 
                                                    month: 'long', 
                                                    year: 'numeric' 
                                                    })}
                                                </div>
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

export default Fairs;