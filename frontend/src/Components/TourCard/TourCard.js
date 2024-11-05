import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import './TourCard.css';
import Axios from '../../Axios';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CalendarMonthTwoToneIcon from '@mui/icons-material/CalendarMonthTwoTone';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Tabs, message } from 'antd';

const CustomButton = styled(Button)({
    "&.MuiButton": {
        color: "black",
        borderColor: "black",
        "&:hover": {
            borderColor: "red",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
        },
        "&.Mui-focused": {
            borderColor: "black !important",
        },
        "&.Mui-disabled": {
            borderColor: "rgba(255, 255, 255, 0.3)",
            color: "rgba(255, 255, 255, 0.3)",
        },
    },
});

const { TabPane } = Tabs;

const TourCard = ({ role, tours, setChosenTour, chosenTour, setUpdateGuides, updateGuides }) => {

    const [allGuides, setAllGuides] = useState([]);
    const [tourGuides, setTourGuides] = useState([]);
    const [chosenTourAssignedGuides, setChosenTourAssignedGuides] = useState([]);
    const [chosenTourRequestedGuides, setChosenTourRequestedGuides] = useState([]);
    const [activeTab, setActiveTab] = useState("1");
    const [pending_tours, setPendingTours] = useState([]);
    const [bto_onay_tours, setBTOOnayTours] = useState([]);
    const [final_tours, setFinalTours] = useState([]);

    const handleTourCardClick = (id) => {
        setChosenTour(tours.find(a => a.id === id));
    };

    const handleUpdateGuideClick = () => {
        setUpdateGuides(true);
    };

    // const handleUpdateGuideClose = () => {
    //     setUpdateGuides(false);
    // };

    const handleRemoveGuideClick = (guideId, tourId) => {
        Axios.delete(`/api/guides_tour/cancel_guides_assigned_tour/${guideId}/${tourId}`)
            .then(() => {
                setTourGuides(tourGuides.filter(tourGuide => tourGuide.id !== guideId));
                getGuides();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleAssignGuideClick = (guideId, tourId) => {
        Axios.post(`/api/guides_tour/assign_guide/${guideId}/${tourId}`)
            .then((response) => {
                setTourGuides([...tourGuides, response.data]);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleAdvisorAcceptTour = (id) => {
        Axios.post(`/api/tours/adviser/accept_tour/${id}`)
            .then(() => {
                message.success('Tur başarıyla onaylandı. Son onay bekleniyor!')
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleAdvisorRejectTour = (id) => {
        Axios.post(`/api/tours/adviser/reject_tour/${id}`)
            .then(() => {
                message.error('Tur reddedildi!')
            })
            .catch((error) => {
                console.log(error);
            });
    }


    //get guides
    const getGuides = () => {
        Axios.get('/api/guides_tour/all')
            .then((response) => {
                setTourGuides(response.data);
                // console.log("tour guidessss", response.data)
            })
            .catch((error) => {
                console.log(error);
            });
    }



    useEffect(() => {
        Axios.get('/api/guides/all')
            .then((response) => {
                setAllGuides(response.data);
                // console.log("allllllll guiiiiddeess", response.data)
            })
            .catch((error) => {
                console.log(error);
            });

        getGuides();
    }, []);


    useEffect(() => {
        const assignedGuides = tourGuides
            .filter(tourGuide => tourGuide.status === 'ASSIGNED')
            .map(tourGuide => {
                const guide = allGuides.find(g => g.id === tourGuide.guide_id);
                return guide ? { ...tourGuide, ...guide } : null;  // Combine tourGuide and guide attributes
            })
            .filter(guide => guide);  // Remove any null values
        setChosenTourAssignedGuides(assignedGuides);
        // console.log("asssss", assignedGuides);
    }, [allGuides, tourGuides]);

    useEffect(() => {
        const requestedGuides = tourGuides
            .filter(tourGuide => tourGuide.status === 'REQUESTED')
            .map(tourGuide => {
                const guide = allGuides.find(g => g.id === tourGuide.guide_id);
                return guide ? { ...tourGuide, ...guide } : null;  // Combine tourGuide and guide attributes
            })
            .filter(guide => guide);
        setChosenTourRequestedGuides(requestedGuides);
        // console.log("reqqqq", requestedGuides);
    }, [allGuides, tourGuides]);

    useEffect(() => {
        setPendingTours(tours.filter((tour) => tour.confirmation === 'PENDING'));
    }, [tours]);

    useEffect(() => {
        setBTOOnayTours(tours.filter((tour) => tour.confirmation === 'BTO ONAY'));
    }, [tours]);

    useEffect(() => {
        setFinalTours(tours.filter((tour) => tour.confirmation === 'ONAY'));
    }, [tours]);


    return (
        <>
            <div className="tour-card-tabs-outer-cont" >
                <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab={<span className="tour-card-custom-tab-headers">Son Onayı Bekleyen Turlar</span>} key="1" >
                        {!chosenTour ?
                            (bto_onay_tours.length === 0 ? (
                                <p>Henüz Onaylanan Tur yok.</p>
                            ) : (
                                bto_onay_tours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                                    <div key={index} className="tours-tour-card" onClick={() => handleTourCardClick(tour.id)}>
                                        <div className="tours-tour-header">
                                            <div className="tours-tour-location">
                                                {tour.city || "Belirtilmemiş"}
                                            </div>
                                            <div className="tours-tour-date">
                                                <CalendarMonthTwoToneIcon />
                                                {new Date(tour.date).toLocaleDateString('tr-TR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>

                                        <div className="tours-tour-body">
                                            <div className="tours-tour-school">
                                                {tour.high_school_name}
                                            </div>
                                            <div className="tours-tour-details">
                                                100-200 Misafir, Geri kalan ayrıntıların hepsi burada yazabilir
                                            </div>
                                        </div>

                                        <div className="tours-tour-footer">
                                            <div className="tours-tour-rating">
                                                <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                            </div>
                                            <div className="tours-tour-guide-info">
                                                {chosenTourAssignedGuides.filter(g => g.tour_id === tour.id).length} / {Math.ceil(tour.student_count / 60)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                            ) : (
                                <div className="tours-tour-card non-clickable" >
                                    {!updateGuides ? (
                                        <>
                                            <Tooltip title='Geri'>
                                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setChosenTour(null)}>
                                                    <KeyboardBackspaceIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <div className="tours-tour-card-detail-header">{chosenTour.high_school_name}</div>
                                            <div className="tours-tour-card-details">
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Şehir: </div>
                                                    <div>{chosenTour?.city || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                                    <div>{chosenTour?.teacher_name || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                                    <div>{chosenTour?.teacher_phone_number || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                                    <div>{chosenTour?.teacher_name || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                                    <div>{chosenTour?.student_count || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Tarih:</div>
                                                    <div>
                                                        {new Date(chosenTour.date).toLocaleDateString('tr-TR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Saat:</div>
                                                    <div>
                                                        {new Date(chosenTour.date).toLocaleTimeString('tr-TR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Misafir Notu: </div>
                                                    <div>{chosenTour?.notes || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Atanmış Rehberler ({chosenTourAssignedGuides.filter(guide => guide.tour_id === chosenTour.id).length} / {Math.ceil(chosenTour.student_count / 60)}):  </div>
                                                    <div className="req-ass-content">
                                                        {chosenTourAssignedGuides.filter(g => g.tour_id === chosenTour.id).map((guide, index) => (
                                                            <span key={guide.id}>
                                                                {guide.name}{index < chosenTourAssignedGuides.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="tours-tour-card-buttons">
                                                <CustomButton className="tours-tour-card-button one" onClick={() => handleUpdateGuideClick()}>Rehber Ata / Değiştir</CustomButton>
                                                <CustomButton className="tours-tour-card-button two">Düzenle</CustomButton>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Tooltip title='Geri'>
                                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setUpdateGuides(false)}>
                                                    <KeyboardBackspaceIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <div className="tours-tour-card-update-guide-update-page-general">
                                                {/* Assigned Guides */}
                                                <div className="tour-card-update-page-assigned">
                                                    <div className="assigned-guides-cont">
                                                        <div className="tours-tour-card-detail-header">Atanmış Rehberler: {chosenTourAssignedGuides.filter(g => g.tour_id === chosenTour.id).length} / {Math.ceil(chosenTour.student_count / 60)}</div>
                                                        <div className="req-ass-content">
                                                            {chosenTourAssignedGuides.filter(guide => guide.tour_id === chosenTour.id).map(guide => (
                                                                <div key={guide.id} className="guide-tag assigned">
                                                                    <div>
                                                                        <span>{guide.name}</span> / <span>{guide.guide_rating}</span> <StarIcon style={{ color: 'white' }} />
                                                                    </div>
                                                                    <div>
                                                                        <Tooltip title='Sil'>
                                                                            <IconButton style={{ color: 'white' }} onClick={() => handleRemoveGuideClick(guide.id, chosenTour.id)}>
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Requested Guides */}
                                                <div className="tour-card-update-page-req-free">
                                                    <div className="free-req-guides">
                                                        <div className="tours-tour-card-detail-header">Atanabilecek Rehberler:</div>
                                                        <div className="req-ass-content">
                                                            {allGuides
                                                                .filter(guide => !tourGuides.some(tourGuide => tourGuide.guide_id === guide.id && tourGuide.tour_id === chosenTour.id))
                                                                .map(guide => (
                                                                    <div key={guide.id} className="guide-tag available">
                                                                        <div>
                                                                            <span>{guide.name}</span> / <span>{guide.guide_rating}</span> <StarIcon style={{ color: 'white' }} />
                                                                        </div>
                                                                        <div>
                                                                            {chosenTourAssignedGuides.filter(g => g.tour_id === chosenTour.id).length < Math.ceil(chosenTour.student_count / 60) &&
                                                                                <Tooltip title='Ekle'>
                                                                                    <IconButton style={{ color: 'white' }} onClick={() => handleAssignGuideClick(guide.id, chosenTour.id)}>
                                                                                        <AddCircleIcon />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>

                                                    <div className="free-req-guides">
                                                        <div className="tours-tour-card-detail-header">Talep Eden Rehberler:</div>
                                                        <div className="req-ass-content">
                                                            {chosenTourRequestedGuides.filter(guide => guide.tour_id === chosenTour.id).map(guide => (
                                                                <div key={guide.id} className="guide-tag requested">
                                                                    <div>
                                                                        <span>{guide.name}</span> / <span>{guide.guide_rating}</span> <StarIcon style={{ color: 'white' }} />
                                                                    </div>
                                                                    <div>
                                                                        {chosenTourAssignedGuides.filter(g => g.tour_id === chosenTour.id).length < Math.ceil(chosenTour.student_count / 60) &&
                                                                            <Tooltip title='Ekle'>
                                                                                <IconButton style={{ color: 'white' }} onClick={() => handleAssignGuideClick(guide.id, chosenTour.id)}>
                                                                                    <AddCircleIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                        </>
                                    )
                                    }

                                </div>
                            )
                        }
                    </TabPane>
                    <TabPane tab={<span className="tour-card-custom-tab-headers" >Son Onayı Almış Turlar</span>} key="2" >
                        {!chosenTour &&
                            (final_tours.length === 0 ? (
                                <p>Tur başvurusu bulunmamaktadır.</p>
                            ) : (
                                final_tours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                                    <div key={index} className="tours-tour-card" >
                                        <div className="tours-tour-header">
                                            <div className="tours-tour-location">
                                                {tour.city || "Belirtilmemiş"}
                                            </div>
                                            <div className="tours-tour-date">
                                                <CalendarMonthTwoToneIcon />
                                                {new Date(tour.date).toLocaleDateString('tr-TR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>

                                        <div className="tours-tour-body">
                                            <div className="tours-tour-school">
                                                {tour.high_school_name}
                                            </div>
                                            <div className="tours-tour-details">
                                                100-200 Misafir, Geri kalan ayrıntıların hepsi burada yazabilir
                                            </div>
                                        </div>

                                        <div className="tours-tour-footer">
                                            <div className="tours-tour-rating">
                                                <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ))}
                    </TabPane>

                    {((role === 'admin') || (role === 'advisor') || (role === 'basic')) &&
                        <TabPane tab={<span className="tour-card-custom-tab-headers" >Onay Bekleyen Turlar</span>} key="3" >
                            {!chosenTour &&
                                (pending_tours.length === 0 ? (
                                    <p>Tur başvurusu bulunmamaktadır.</p>
                                ) : (
                                    pending_tours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                                        <div key={index} className="tours-tour-card" >
                                            <div className="tours-tour-header">
                                                <div className="tours-tour-location">
                                                    {tour.city || "Belirtilmemiş"}
                                                </div>
                                                <div className="tours-tour-date">
                                                    <CalendarMonthTwoToneIcon />
                                                    {new Date(tour.date).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </div>

                                            <div className="tours-tour-body">
                                                <div className="tours-tour-school">
                                                    {tour.high_school_name}
                                                </div>
                                                <div className="tours-tour-details">
                                                    100-200 Misafir, Geri kalan ayrıntıların hepsi burada yazabilir
                                                </div>
                                            </div>

                                            <div className="tours-tour-footer">
                                                <div className="tours-tour-rating">
                                                    <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                                </div>
                                            </div>

                                            <div className="tours-tour-card-buttons">
                                                <CustomButton className="tours-tour-card-button one" onClick={() => handleAdvisorAcceptTour(tour.id)}>Turu Onayla</CustomButton>
                                                <CustomButton className="tours-tour-card-button two" onClick={() => handleAdvisorRejectTour(tour.id)}>Turu Reddet</CustomButton>
                                            </div>
                                        </div>
                                    ))
                                ))}
                        </TabPane>
                    }
                </Tabs>
            </div>
        </>
    );
};

export default TourCard;

