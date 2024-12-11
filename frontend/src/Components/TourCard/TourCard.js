import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import './TourCard.css';
import Axios from '../../Axios';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CalendarMonthTwoToneIcon from '@mui/icons-material/CalendarMonthTwoTone';
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Tabs, message, Input, Select, ConfigProvider, DatePicker, TimePicker, Modal } from 'antd';
import trTR from 'antd/lib/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import SchoolTourCard from './SchoolTourCard/SchoolTourCard';

dayjs.locale('tr');

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

const TourCard = ({ role, tours, setTours, setChosenTour, chosenTour, chosenPendingTourCard,
    setChosenPendingTourCard, chosenFinalTourCard, setChosenFinalTourCard, setUpdateGuides, updateGuides,
    chosenRejectedTourCard, setChosenRejectedTourCard,
    chosenPastTourCard, setChosenPastTourCard, schosenPastTourCard, ssetChosenPastTourCard, schosenPendingTourCard, ssetChosenPendingTourCard,
    schosenUpcomingTourCard, ssetChosenUpcomingTourCard, schosenRejectedTourCard, ssetChosenRejectedTourCard }) => {

    const [allGuides, setAllGuides] = useState([]);
    const [tourGuides, setTourGuides] = useState([]);
    const [chosenTourAssignedGuides, setChosenTourAssignedGuides] = useState([]);
    const [chosenTourRequestedGuides, setChosenTourRequestedGuides] = useState([]);
    const [activeTab, setActiveTab2] = useState("1");
    const [pending_tours, setPendingTours] = useState([]);
    const [bto_onay_tours, setBTOOnayTours] = useState([]);
    const [final_tours, setFinalTours] = useState([]);
    const [rejected_tours, setRejectedTours] = useState([]);
    const [editedTour, setEditTour] = useState(null);
    // const [chosenPendingTourCard, setChosenPendingTourCard] = useState(null);
    // const [chosenFinalTourCard, setChosenFinalTourCard] = useState(null);
    // const [chosenPastTourCard, setChosenPastTourCard] = useState(null);
    // const [chosenRejectedTourCard, setChosenRejectedTourCard] = useState(null);

    const [schoolPending, setSchoolPending] = useState([]);

    // FEEDBACK //
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisible2, setIsModalVisible2] = useState(false);
    const [isModalVisible3, setIsModalVisible3] = useState(false);
    const [isModalVisible4, setIsModalVisible4] = useState(false);
    const [feedback, setFeedback] = useState("");


    // ADVISOR ACCEPT
    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        Axios.post(`/api/tours/advisor/accept_tour/${chosenPendingTourCard.id}?feedback=${feedback}`)
            .then(() => {
                fetchAllTours();
                setChosenTour(null);
                setChosenPendingTourCard(null);
                message.success("Başvuru kabul edildi. Son onay bekleniyor!");
            })
            .catch((error) => {
                console.log(error);
            });
        setIsModalVisible(false);
        setFeedback("");
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setFeedback("");
    };


    // ADVISOR REJECT
    const showModal2 = () => {
        setIsModalVisible2(true);
    };

    const handleOk2 = () => {
        Axios.post(`/api/tours/advisor/reject_tour/${chosenPendingTourCard.id}?feedback=${feedback}`)
            .then(() => {
                fetchAllTours();
                setChosenPendingTourCard(null);
                setChosenTour(null);
                message.error('Tur reddedildi!')
            })
            .catch((error) => {
                console.log(error);
            });
        setIsModalVisible2(false);
        setFeedback("");
    };

    const handleCancel2 = () => {
        setIsModalVisible2(false);
        setFeedback("");
    };


    // SUDO ACCEPT
    const showModal3 = () => {
        setIsModalVisible3(true);
    };

    const handleOk3 = () => {
        handleAcceptTour(chosenTour.id);
        setIsModalVisible3(false);
        setFeedback("");
    };

    const handleCancel3 = () => {
        setIsModalVisible3(false);
        setFeedback("");
    };


    // SUDO REJECT
    const showModal4 = () => {
        setIsModalVisible4(true);
    };

    const handleOk4 = () => {
        handleRejectTour(chosenTour.id);
        setIsModalVisible4(false);
        setFeedback("");
    };

    const handleCancel4 = () => {
        setIsModalVisible4(false);
        setFeedback("");
    };

    // FEEDBACK //


    const setActiveTab = (key) => {
        setActiveTab2(key);
        setChosenFinalTourCard(null);
        setChosenRejectedTourCard(null);
        setChosenPastTourCard(null);
        setChosenTour(null);
        setChosenPendingTourCard(null);
    }

    useEffect(() => {
        if (role === 'guide') {
            setActiveTab("2");
        }
        else if (role === 'school') {
            setActiveTab("6");
        }
    }, [role]);


    const handleTourCardClick = (id) => {
        setChosenTour(tours.find(a => a.id === id));
    };

    const handleUpdateGuideClick = () => {
        setUpdateGuides(true);
    };

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

    const fetchAllTours = () => {
        Axios.get("/api/tours/all")
            .then((response) => {
                setTours(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleAssignGuideClick = (guideId, tourId) => {
        try {
            Axios.post(`/api/guides_tour/assign_guide/${guideId}/${tourId}`)
                .then((response) => {
                    setTourGuides([...tourGuides, response.data]);
                    getGuides();
                })
                .catch((error) => {
                    console.log(error);
                });

        } catch (error) {
            console.error("Error assigning guide:", error);
        }
    }

    const handleRejectTour = (id) => {
        if (role === 'advisor') {
            Axios.post(`/api/tours/advisor/reject_tour/${id}?feedback=${feedback}`)
                .then(() => {
                    fetchAllTours();
                    setChosenPendingTourCard(null);
                    message.error('Tur reddedildi!')
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        else {
            Axios.post(`/api/tours/sudo/reject_tour/${id}?feedback=${feedback}`)
                .then(() => {
                    fetchAllTours();
                    setChosenTour(null);
                    setChosenPendingTourCard(null);
                    message.success('Tur kalıcı olarak reddedildi!')
                }
                )
                .catch((error) => {
                    console.log(error);
                });
            setChosenTour(null);
        }
    }


    const handleAcceptTour = (id) => {
        if (role === "advisor") {
            Axios.post(`/api/tours/advisor/accept_tour/${id}?feedback=${feedback}`)
                .then(() => {
                    fetchAllTours();
                    setChosenPendingTourCard(null);
                    message.success("Başvuru kabul edildi. Son onay bekleniyor!");
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            Axios.post(`/api/tours/sudo/accept_tour/${id}?feedback=${feedback}`)
                .then(() => {
                    fetchAllTours();
                    setChosenTour(null);
                    setChosenPendingTourCard(null);
                    message.success("Tur başarıyla onaylandı!");
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };


    const handleCancelTourGuideRequest = (tourId) => {
        const user = JSON.parse(localStorage.getItem("user"));
        const userIdd = user?.id;
        Axios.delete(`/api/guides_tour/cancel_guides_requested_tour/${userIdd}/${tourId}`)
            .then((response) => {
                if (response.status === 204 || response.status === 200) {
                    message.success('Rehberlik talebiniz iptal edildi!');
                    fetchAllTours();
                    getGuides();
                } else {
                    throw new Error("Unexpected response status");
                }
            })
            .catch((error) => {
                console.log("Error details:", error.response || error);
                message.error('Talebiniz iptal edilemedi!');
            });
    }


    const handleGuideRequest = (tourId) => {
        const user = JSON.parse(localStorage.getItem("user"));
        const userIdd = user?.id;
        // console.log("userIdd", userIdd);
        Axios.post(`/api/guides_tour/request_guideness/${userIdd}/${tourId}`)
            .then(() => {
                fetchAllTours();
                getGuides();
                message.success('Rehberlik talebiniz başarıyla iletildi!')
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
                // console.log("all guides", response.data)
            })
            .catch((error) => {
                console.log(error);
            });

        getGuides();
    }, []);


    // EDIT TOUR INFO
    const handleSaveEditedTour = () => {
        // console.log("SENDED TOUR: ", editedTour);
        Axios.patch(`/api/tours/edit/${editedTour.id}`, editedTour)
            .then((response) => {
                fetchAllTours();
                // console.log("Tour updated successfully:", response.data);
            })
            .catch((error) => {
                console.error("Error updating the tour:", error.response?.data || error.message);
            });
        setChosenTour(editedTour);
        setEditTour(null);
    }


    const filterPreviousTours = (tourList) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return tourList.filter((tour) => {
            const tourDate = new Date(tour.date);
            tourDate.setHours(0, 0, 0, 0);

            // console.log(`Tour Date: ${tourDate}, Today: ${today}, Is Previous: ${tourDate < today}`);
            return tourDate < today;
        });
    };

    const filterUpcomingTours = (tourList) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return tourList.filter((tour) => {
            const tourDate = new Date(tour.date);
            tourDate.setHours(0, 0, 0, 0);

            // console.log(`Tour Date: ${tourDate}, Today: ${today}, Is Previous: ${tourDate < today}`);
            return tourDate >= today;
        });
    };


    useEffect(() => {
        const assignedGuides = tourGuides
            .filter(tourGuide => tourGuide.status === 'ASSIGNED')
            .map(tourGuide => {
                const guide = allGuides.find(g => g.user_id === tourGuide.guide_id);
                return guide ? { ...tourGuide, ...guide } : null;  // Combine tourGuide and guide attributes
            })
            .filter(guide => guide);  // Remove any null values
        setChosenTourAssignedGuides(assignedGuides);
        // console.log("asssss", assignedGuides);

        const requestedGuides = tourGuides
            .filter(tourGuide => tourGuide.status === 'REQUESTED')
            .map(tourGuide => {
                const guide = allGuides.find(g => g.user_id === tourGuide.guide_id);
                return guide ? { ...tourGuide, ...guide } : null;  // Combine tourGuide and guide attributes
            })
            .filter(guide => guide);
        setChosenTourRequestedGuides(requestedGuides);
        // console.log("reqqqq", requestedGuides); 
    }, [allGuides, tourGuides]);


    const handleOutDated = (rrr) => {
        // console.log("outdateda girennnnnnnn", rrr);
        const prev = filterPreviousTours(rrr);
        // console.log("prevvvvvvvvvvv", prev);
        prev.forEach((tour) => {
            Axios.post(`/api/tours/sudo/reject_tour/${tour.id}?feedback=Tarihi geçmiş`)
                .then(() => {
                    console.log(`Tur ${tour.id} tarihi geçtiği için reddedildi!`);
                    fetchAllTours();
                })
                .catch((error) => {
                    console.log(`Tur ${tour.id} tarihi geçtiği için reddedilemedi: `, error);
                    // message.error(`Tur ${tour.id} reddedilemedi!`);
                });
        });
    }


    useEffect(() => {
        handleOutDated(schoolPending);
    }, [schoolPending, final_tours]);

    useEffect(() => {
        setPendingTours(tours.filter((tour) => tour.confirmation === 'PENDING'));
    }, [tours]);

    useEffect(() => {
        setBTOOnayTours(tours.filter((tour) => tour.confirmation === 'BTO ONAY'));
    }, [tours]);

    useEffect(() => {
        setFinalTours(tours.filter((tour) => tour.confirmation === 'ONAY'));
    }, [tours]);

    useEffect(() => {
        setSchoolPending(tours.filter((tour) => tour.confirmation === 'PENDING' || tour.confirmation === 'BTO ONAY'));
    }, [tours]);

    useEffect(() => {
        setRejectedTours(tours.filter((tour) => (tour.confirmation === 'RET' || tour.confirmation === 'BTO RET')));
    }, [tours]);



    const [previousTours, setPreviousTours] = useState([]);
    const [upcomingTours, setUpcomingTours] = useState([]);

    useEffect(() => {
        setPreviousTours(filterPreviousTours(final_tours));
        setUpcomingTours(filterUpcomingTours(final_tours));
    }, [final_tours]);


    // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa: ", chosenTourAssignedGuides);

    return (
        <>
            <div className="tour-card-tabs-outer-cont" >

                {role === 'school' ?
                    <SchoolTourCard role={role} pending={schoolPending} upcoming={upcomingTours}
                        rejected={rejected_tours} previous={previousTours} fetchAllTours={fetchAllTours}
                        schosenPastTourCard={schosenPastTourCard}
                        schosenPendingTourCard={schosenPendingTourCard}
                        schosenUpcomingTourCard={schosenUpcomingTourCard}
                        schosenRejectedTourCard={schosenRejectedTourCard}
                        ssetChosenPastTourCard={ssetChosenPastTourCard}
                        ssetChosenPendingTourCard={ssetChosenPendingTourCard}
                        ssetChosenUpcomingTourCard={ssetChosenUpcomingTourCard}
                        ssetChosenRejectedTourCard={ssetChosenRejectedTourCard}
                        chosenTourAssignedGuides={chosenTourAssignedGuides}
                    />
                    :
                    <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={setActiveTab}>

                        {/* ILK BAŞVURU  */}
                        {((role === 'admin') || (role === 'advisor')) &&
                            <TabPane tab={<span className="tour-card-custom-tab-headers" >Başvurular</span>} key="1" >
                                {!chosenPendingTourCard ?
                                    (pending_tours.length === 0 ? (
                                        <p>Tur başvurusu bulunmamaktadır.</p>
                                    ) : (
                                        <div>
                                            {pending_tours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                                                <div key={index} className="tours-tour-card" onClick={() => setChosenPendingTourCard(tour)}>
                                                    <div className="tours-tour-header">
                                                        <div className="tours-tour-location">
                                                            {tour.city || "Belirtilmemiş"}
                                                        </div>
                                                        <div className="tours-tour-datetime">
                                                            <div className="tours-tour-date">
                                                                <CalendarMonthTwoToneIcon />
                                                                <>
                                                                    {new Date(tour.date).toLocaleDateString('tr-TR', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                    })}
                                                                </>
                                                            </div>
                                                            <div className="tours-tour-time">
                                                                <AccessTimeTwoToneIcon />
                                                                <>
                                                                    {new Date(tour.date).toLocaleTimeString('tr-TR', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="tours-tour-body">
                                                        <div className="tours-tour-school">
                                                            {tour.high_school_name}
                                                        </div>
                                                        <div className="tours-tour-details">
                                                            {tour?.student_count} Öğrenci
                                                        </div>
                                                    </div>

                                                    <div className="tours-tour-footer">
                                                        <div className="tours-tour-rating">
                                                            <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                                            {/* SHOOL RATE HERE */}
                                                        </div>
                                                    </div>


                                                </div>
                                            ))}
                                        </div>
                                    )
                                    )
                                    : (
                                        <div className="tours-tour-card non-clickable">
                                            <Tooltip title='Geri'>
                                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setChosenPendingTourCard(null)}>
                                                    <KeyboardBackspaceIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <div className="tours-tour-card-detail-header">{chosenPendingTourCard.high_school_name}</div>
                                            <div className="tours-tour-card-details">
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Şehir: </div>
                                                    <div>{chosenPendingTourCard?.city || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                                    <div>{chosenPendingTourCard?.teacher_name || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                                    <div>{chosenPendingTourCard?.teacher_phone_number || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                                    <div>{chosenPendingTourCard?.student_count || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Tarih:</div>
                                                    <div>
                                                        {new Date(chosenPendingTourCard.date).toLocaleDateString('tr-TR', {
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
                                                        {new Date(chosenPendingTourCard.date).toLocaleTimeString('tr-TR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Misafir Notu: </div>
                                                    <div>{chosenPendingTourCard?.notes || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <br />
                                            </div>
                                            <div className="tours-tour-card-buttons">
                                                <CustomButton className="tours-tour-card-button one" onClick={showModal}>Turu Onayla</CustomButton>
                                                <Modal
                                                    title="Başvuruyu Kabul Et"
                                                    visible={isModalVisible}
                                                    onOk={handleOk}
                                                    onCancel={handleCancel}
                                                    okText="Onayla"
                                                    cancelText="İptal"
                                                >
                                                    <p>Başvuruyu kabul etmek istediğinizden emin misiniz?</p>
                                                    <Input.TextArea
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                        placeholder="Eklemek istediğiniz bir not var mı? (Opsiyonel)"
                                                        rows={4}
                                                    />
                                                </Modal>
                                                <CustomButton className="tours-tour-card-button two" onClick={showModal2}>Turu Reddet</CustomButton>
                                                <Modal
                                                    title="Başvururyu Reddet"
                                                    visible={isModalVisible2}
                                                    onOk={handleOk2}
                                                    onCancel={handleCancel2}
                                                    okText="Onayla"
                                                    cancelText="İptal"
                                                >
                                                    <p>Başvuruyu kalıcı olarak reddetmek istediğinizden emin misiniz? Bu işlem okula bildirilir!</p>
                                                    <Input.TextArea
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                        placeholder="Eklemek istediğiniz bir not var mı? (Opsiyonel)"
                                                        rows={4}
                                                    />
                                                </Modal>
                                            </div>
                                        </div>
                                    )}
                            </TabPane>
                        }




                        {/* GUIDE ATAMASI SÜREN / BTO ONAYI BEKLEYENLER */}
                        {((role === 'admin') || (role === 'advisor') || (role === 'guide')) &&
                            <TabPane tab={<span className="tour-card-custom-tab-headers">Onay Bekleyen Turlar</span>} key="2" >
                                {!chosenTour ?
                                    (bto_onay_tours.length === 0 ? (
                                        <p>Onaylanacak tur bulunmamaktadır.</p>
                                    ) : (
                                        bto_onay_tours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                                            <div key={index} className="tours-tour-card" onClick={() => handleTourCardClick(tour.id)}>
                                                <div className="tours-tour-header">
                                                    <div className="tours-tour-location">
                                                        {tour.city || "Belirtilmemiş"}
                                                    </div>
                                                    <div className="tours-tour-datetime">
                                                        <div className="tours-tour-date">
                                                            <CalendarMonthTwoToneIcon />
                                                            <>
                                                                {new Date(tour.date).toLocaleDateString('tr-TR', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                })}
                                                            </>
                                                        </div>
                                                        <div className="tours-tour-time">
                                                            <AccessTimeTwoToneIcon />
                                                            <>
                                                                {new Date(tour.date).toLocaleTimeString('tr-TR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="tours-tour-body">
                                                    <div className="tours-tour-school">
                                                        {tour.high_school_name}
                                                    </div>
                                                    <div className="tours-tour-details">
                                                        {tour?.student_count} Öğrenci
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
                                            {!updateGuides && !editedTour ? (
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
                                                        <div className="tour-card-detail-format">
                                                            <div className="tour-card-detail-format2">Onaylayan Advisor Notu: </div>
                                                            <div>{chosenTour?.feedback || 'Belirtilmemiş'}</div>
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
                                                        {role === 'guide' ?
                                                            <>
                                                                {chosenTourRequestedGuides.some(
                                                                    (guide) =>
                                                                        guide.tour_id === chosenTour.id &&
                                                                        guide.guide_id === JSON.parse(localStorage.getItem("user")).id
                                                                )
                                                                    ?
                                                                    <>
                                                                        <CustomButton disabled className="tours-tour-card-button special" >Talep Oluşturuldu!</CustomButton>
                                                                        <CustomButton className="tours-tour-card-button one" onClick={() => handleCancelTourGuideRequest(chosenTour.id)} >Talebi iptal et</CustomButton>
                                                                    </>
                                                                    :
                                                                    chosenTourAssignedGuides.some(
                                                                        (guide) =>
                                                                            guide.tour_id === chosenTour.id &&
                                                                            guide.guide_id === JSON.parse(localStorage.getItem("user")).id
                                                                    )
                                                                        ?
                                                                        <CustomButton disabled className="tours-tour-card-button special">Bu turda görevlisiniz!</CustomButton>
                                                                        :
                                                                        <CustomButton className="tours-tour-card-button one" onClick={() => handleGuideRequest(chosenTour.id)}>Rehber olarak görev al</CustomButton>
                                                                }
                                                            </>
                                                            :
                                                            role === 'admin' ?
                                                                <>
                                                                    <CustomButton className="tours-tour-card-button one" onClick={() => handleUpdateGuideClick()}>Rehber Ata / Değiştir</CustomButton>
                                                                    <CustomButton className="tours-tour-card-button two" onClick={showModal3}>Onayla</CustomButton>
                                                                    <Modal
                                                                        title="Turu Onayla"
                                                                        visible={isModalVisible3}
                                                                        onOk={handleOk3}
                                                                        onCancel={handleCancel3}
                                                                        okText="Onayla"
                                                                        cancelText="İptal"
                                                                    >
                                                                        <p>Turun son halini aldığından ve onaylamak istediğinizden emin misiniz? Bu işlem okula bildirilir!</p>
                                                                        <Input.TextArea
                                                                            value={feedback}
                                                                            onChange={(e) => setFeedback(e.target.value)}
                                                                            placeholder="Eklemek istediğiniz bir not var mı? (Opsiyonel)"
                                                                            rows={4}
                                                                        />
                                                                    </Modal>
                                                                    <CustomButton className="tours-tour-card-button three" onClick={showModal4}>Reddet</CustomButton>
                                                                    <Modal
                                                                        title="Turu Onayla"
                                                                        visible={isModalVisible4}
                                                                        onOk={handleOk4}
                                                                        onCancel={handleCancel4}
                                                                        okText="Onayla"
                                                                        cancelText="İptal"
                                                                    >
                                                                        <p>Turun kalıcı olarak reddetmek istediğinizden emin misiniz? Bu işlem okula bildirilir!</p>
                                                                        <Input.TextArea
                                                                            value={feedback}
                                                                            onChange={(e) => setFeedback(e.target.value)}
                                                                            placeholder="Eklemek istediğiniz bir not var mı? (Opsiyonel)"
                                                                            rows={4}
                                                                        />
                                                                    </Modal>
                                                                </>
                                                                :
                                                                <>
                                                                    <CustomButton className="tours-tour-card-button one" onClick={() => handleUpdateGuideClick()}>Rehber Ata / Değiştir</CustomButton>
                                                                </>
                                                        }
                                                    </div>
                                                </>
                                            ) : ((!editedTour ? (
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
                                                                                    <IconButton style={{ color: 'white' }} onClick={() => handleRemoveGuideClick(guide.user_id, chosenTour.id)}>
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
                                                                        .filter(guide => !tourGuides.some(tourGuide => tourGuide.guide_id === guide.user_id && tourGuide.tour_id === chosenTour.id))
                                                                        .map(guide => (
                                                                            <div key={guide.id} className="guide-tag available">
                                                                                <div>
                                                                                    <span>{guide.name}</span> / <span>{guide.guide_rating}</span> <StarIcon style={{ color: 'white' }} />
                                                                                </div>
                                                                                <div>
                                                                                    {chosenTourAssignedGuides.filter(g => g.tour_id === chosenTour.id).length < Math.ceil(chosenTour.student_count / 60) &&
                                                                                        <Tooltip title='Ekle'>
                                                                                            <IconButton style={{ color: 'white' }} onClick={() => handleAssignGuideClick(guide.user_id, chosenTour.id)}>
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
                                                                                        <IconButton style={{ color: 'white' }} onClick={() => handleAssignGuideClick(guide.user_id, chosenTour.id)}>
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
                                            ) : (
                                                <>
                                                    <Tooltip title='Geri'>
                                                        <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setEditTour(null)}>
                                                            <KeyboardBackspaceIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <div className="tours-tour-card-detail-header">{chosenTour.high_school_name}</div>
                                                    <div className="tours-tour-card-details">
                                                        <div className="tour-card-detail-format">
                                                            <div className="tour-card-detail-format2" style={{ width: '300px' }}>Şehir: </div>
                                                            <Select
                                                                placeholder={chosenTour?.city || 'Belirtilmemiş'}
                                                                style={{ width: 300, backgroundColor: '#f8f9fa' }}
                                                                allowClear
                                                                variant="borderless"
                                                                onChange={(value) => setEditTour({ ...editedTour, city: value })}
                                                                options={[
                                                                    { value: 'Adana', label: 'Adana' },
                                                                    { value: 'Adıyaman', label: 'Adıyaman' },
                                                                    { value: 'Afyonkarahisar', label: 'Afyonkarahisar' },
                                                                    { value: 'Ağrı', label: 'Ağrı' },
                                                                    { value: 'Amasya', label: 'Amasya' },
                                                                    { value: 'Ankara', label: 'Ankara' },
                                                                    { value: 'Antalya', label: 'Antalya' },
                                                                    { value: 'Artvin', label: 'Artvin' },
                                                                    { value: 'Aydın', label: 'Aydın' },
                                                                    { value: 'Balıkesir', label: 'Balıkesir' },
                                                                    { value: 'Bilecik', label: 'Bilecik' },
                                                                    { value: 'Bingöl', label: 'Bingöl' },
                                                                    { value: 'Bitlis', label: 'Bitlis' },
                                                                    { value: 'Bolu', label: 'Bolu' },
                                                                    { value: 'Burdur', label: 'Burdur' },
                                                                    { value: 'Bursa', label: 'Bursa' },
                                                                    { value: 'Çanakkale', label: 'Çanakkale' },
                                                                    { value: 'Çankırı', label: 'Çankırı' },
                                                                    { value: 'Çorum', label: 'Çorum' },
                                                                    { value: 'Denizli', label: 'Denizli' },
                                                                    { value: 'Diyarbakır', label: 'Diyarbakır' },
                                                                    { value: 'Edirne', label: 'Edirne' },
                                                                    { value: 'Elazığ', label: 'Elazığ' },
                                                                    { value: 'Erzincan', label: 'Erzincan' },
                                                                    { value: 'Erzurum', label: 'Erzurum' },
                                                                    { value: 'Eskişehir', label: 'Eskişehir' },
                                                                    { value: 'Gaziantep', label: 'Gaziantep' },
                                                                    { value: 'Giresun', label: 'Giresun' },
                                                                    { value: 'Gümüşhane', label: 'Gümüşhane' },
                                                                    { value: 'Hakkari', label: 'Hakkari' },
                                                                    { value: 'Hatay', label: 'Hatay' },
                                                                    { value: 'Isparta', label: 'Isparta' },
                                                                    { value: 'Mersin', label: 'Mersin' },
                                                                    { value: 'İstanbul', label: 'İstanbul' },
                                                                    { value: 'İzmir', label: 'İzmir' },
                                                                    { value: 'Kars', label: 'Kars' },
                                                                    { value: 'Kastamonu', label: 'Kastamonu' },
                                                                    { value: 'Kayseri', label: 'Kayseri' },
                                                                    { value: 'Kırklareli', label: 'Kırklareli' },
                                                                    { value: 'Kırşehir', label: 'Kırşehir' },
                                                                    { value: 'Kocaeli', label: 'Kocaeli' },
                                                                    { value: 'Konya', label: 'Konya' },
                                                                    { value: 'Kütahya', label: 'Kütahya' },
                                                                    { value: 'Malatya', label: 'Malatya' },
                                                                    { value: 'Manisa', label: 'Manisa' },
                                                                    { value: 'Kahramanmaraş', label: 'Kahramanmaraş' },
                                                                    { value: 'Mardin', label: 'Mardin' },
                                                                    { value: 'Muğla', label: 'Muğla' },
                                                                    { value: 'Muş', label: 'Muş' },
                                                                    { value: 'Nevşehir', label: 'Nevşehir' },
                                                                    { value: 'Niğde', label: 'Niğde' },
                                                                    { value: 'Ordu', label: 'Ordu' },
                                                                    { value: 'Rize', label: 'Rize' },
                                                                    { value: 'Sakarya', label: 'Sakarya' },
                                                                    { value: 'Samsun', label: 'Samsun' },
                                                                    { value: 'Siirt', label: 'Siirt' },
                                                                    { value: 'Sinop', label: 'Sinop' },
                                                                    { value: 'Sivas', label: 'Sivas' },
                                                                    { value: 'Tekirdağ', label: 'Tekirdağ' },
                                                                    { value: 'Tokat', label: 'Tokat' },
                                                                    { value: 'Trabzon', label: 'Trabzon' },
                                                                    { value: 'Tunceli', label: 'Tunceli' },
                                                                    { value: 'Şanlıurfa', label: 'Şanlıurfa' },
                                                                    { value: 'Uşak', label: 'Uşak' },
                                                                    { value: 'Van', label: 'Van' },
                                                                    { value: 'Yozgat', label: 'Yozgat' },
                                                                    { value: 'Zonguldak', label: 'Zonguldak' },
                                                                    { value: 'Aksaray', label: 'Aksaray' },
                                                                    { value: 'Bayburt', label: 'Bayburt' },
                                                                    { value: 'Karaman', label: 'Karaman' },
                                                                    { value: 'Kırıkkale', label: 'Kırıkkale' },
                                                                    { value: 'Batman', label: 'Batman' },
                                                                    { value: 'Şırnak', label: 'Şırnak' },
                                                                    { value: 'Bartın', label: 'Bartın' },
                                                                    { value: 'Ardahan', label: 'Ardahan' },
                                                                    { value: 'Iğdır', label: 'Iğdır' },
                                                                    { value: 'Yalova', label: 'Yalova' },
                                                                    { value: 'Karabük', label: 'Karabük' },
                                                                    { value: 'Kilis', label: 'Kilis' },
                                                                    { value: 'Osmaniye', label: 'Osmaniye' },
                                                                    { value: 'Düzce', label: 'Düzce' }
                                                                ]}
                                                            />
                                                        </div>
                                                        <br />
                                                        <div className="tour-card-detail-format">
                                                            <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                                            <Input
                                                                className='tour-card-edit-tour-input'
                                                                placeholder={chosenTour?.teacher_name || 'Belirtilmemiş'}
                                                                allowClear
                                                                variant="borderless"
                                                                onChange={(e) =>
                                                                    setEditTour((prev) => ({
                                                                        ...prev,
                                                                        teacher_name: e.target.value
                                                                    }))
                                                                }
                                                            />

                                                        </div>
                                                        <br />
                                                        <div className="tour-card-detail-format">
                                                            <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                                            <Input
                                                                className='tour-card-edit-tour-input'
                                                                placeholder={chosenTour?.teacher_phone_number || 'Belirtilmemiş'}
                                                                allowClear
                                                                variant="borderless"
                                                                onChange={(e) =>
                                                                    setEditTour((prev) => ({
                                                                        ...prev,
                                                                        teacher_phone_number: e.target.value
                                                                    }))
                                                                }
                                                            />

                                                        </div>
                                                        <br />
                                                        <div className="tour-card-detail-format">
                                                            <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                                            <Input
                                                                className='tour-card-edit-tour-input'
                                                                placeholder={chosenTour?.student_count || 'Belirtilmemiş'}
                                                                variant="borderless"
                                                                type="number"
                                                                onChange={(e) =>
                                                                    setEditTour((prev) => ({
                                                                        ...prev,
                                                                        student_count: e.target.value
                                                                    }))
                                                                }
                                                            />
                                                        </div>
                                                        <br />
                                                        <div className="tour-card-detail-format">
                                                            <div className="tour-card-detail-format2">Tarih:</div>
                                                            <ConfigProvider locale={trTR}>
                                                                <DatePicker
                                                                    className='tour-card-edit-tour-input'
                                                                    type="date"
                                                                    placeholder={chosenTour?.date ? new Date(chosenTour.date).toISOString().split('T')[0] : ''}
                                                                    onChange={(date) => {
                                                                        const updatedDate = new Date(editedTour?.date || new Date());
                                                                        if (date) {
                                                                            updatedDate.setFullYear(date.year(), date.month(), date.date());
                                                                        }
                                                                        setEditTour({ ...editedTour, date: updatedDate.toISOString() });
                                                                    }}
                                                                    format="YYYY-MM-DD"
                                                                    allowClear
                                                                    variant="borderless"
                                                                />
                                                            </ConfigProvider>
                                                        </div>
                                                        <br />
                                                        <div className="tour-card-detail-format">
                                                            <div className="tour-card-detail-format2">Saat:</div>
                                                            <ConfigProvider locale={trTR}>
                                                                <TimePicker
                                                                    className='tour-card-edit-tour-input'
                                                                    placeholder={new Date(chosenTour.date).toLocaleTimeString('tr-TR', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                    format="HH:mm"
                                                                    onChange={(time) => {
                                                                        const updatedDate = new Date(editedTour?.date || new Date());
                                                                        if (time) {
                                                                            updatedDate.setHours(time.hour(), time.minute());
                                                                        }
                                                                        setEditTour({ ...editedTour, date: updatedDate.toISOString() });
                                                                    }}
                                                                    allowClear
                                                                    variant="borderless"
                                                                />
                                                            </ConfigProvider>
                                                        </div>
                                                        <br />
                                                        <div className="tour-card-detail-format">
                                                            <div className="tour-card-detail-format2">Misaifr Notu: </div>
                                                            <Input
                                                                className='tour-card-edit-tour-input'
                                                                placeholder={chosenTour?.notes || 'Belirtilmemiş'}
                                                                allowClear
                                                                variant="borderless"
                                                                onChange={(e) =>
                                                                    setEditTour((prev) => ({
                                                                        ...prev,
                                                                        notes: e.target.value
                                                                    }))
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <br />
                                                    <div className="tours-tour-card-buttons">
                                                        <CustomButton className="tours-tour-card-button one" onClick={() => setEditTour(null)} >Kaydetmeden Çık</CustomButton>
                                                        <CustomButton className="tours-tour-card-button two" onClick={handleSaveEditedTour} >Kaydet</CustomButton>
                                                    </div>
                                                </>
                                            )
                                            )
                                            )}
                                        </div>
                                    )
                                }
                            </TabPane>
                        }





                        {/* ONAYLANMIŞ TURLAR */}
                        {((role === 'admin') || (role === 'advisor') || (role === 'guide')) &&
                            <TabPane tab={<span className="tour-card-custom-tab-headers" >Onaylanmış Turlar</span>} key="3" >
                                {!chosenFinalTourCard ?
                                    (upcomingTours.length === 0 ? (
                                        <p>Yaklaşan tur bulunmamaktadır bulunmamaktadır.</p>
                                    ) : (
                                        upcomingTours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                                            <div key={index} className="tours-tour-card" onClick={() => setChosenFinalTourCard(tour)}>
                                                <div className="tours-tour-header">
                                                    <div className="tours-tour-location">
                                                        {tour.city || "Belirtilmemiş"}
                                                    </div>
                                                    <div className="tours-tour-datetime">
                                                        <div className="tours-tour-date">
                                                            <CalendarMonthTwoToneIcon />
                                                            <>
                                                                {new Date(tour.date).toLocaleDateString('tr-TR', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                })}
                                                            </>
                                                        </div>
                                                        <div className="tours-tour-time">
                                                            <AccessTimeTwoToneIcon />
                                                            <>
                                                                {new Date(tour.date).toLocaleTimeString('tr-TR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="tours-tour-body">
                                                    <div className="tours-tour-school">
                                                        {tour.high_school_name}
                                                    </div>
                                                    <div className="tours-tour-details">
                                                        {tour?.student_count} Öğrenci
                                                    </div>
                                                </div>

                                                <div className="tours-tour-footer">
                                                    <div className="tours-tour-rating">
                                                        <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )) : (
                                        <div className="tours-tour-card non-clickable">
                                            <Tooltip title='Geri'>
                                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setChosenFinalTourCard(null)}>
                                                    <KeyboardBackspaceIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <div className="tours-tour-card-detail-header">{chosenFinalTourCard.high_school_name}</div>
                                            <div className="tours-tour-card-details">
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Şehir: </div>
                                                    <div>{chosenFinalTourCard?.city || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                                    <div>{chosenFinalTourCard?.teacher_name || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                                    <div>{chosenFinalTourCard?.teacher_phone_number || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                                    <div>{chosenFinalTourCard?.student_count || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Tarih:</div>
                                                    <div>
                                                        {new Date(chosenFinalTourCard.date).toLocaleDateString('tr-TR', {
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
                                                        {new Date(chosenFinalTourCard.date).toLocaleTimeString('tr-TR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Misafir Notu: </div>
                                                    <div>{chosenFinalTourCard?.notes || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Okula iletilen onay Notu: </div>
                                                    <div>{chosenFinalTourCard?.feedback || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Atanmış Rehberler: </div>
                                                    <div className="requests">
                                                        {chosenTourAssignedGuides.filter(guide => guide.tour_id === chosenFinalTourCard.id).map(guide => (
                                                            <div key={guide.id} className="guide-tag assigned">
                                                                <div>
                                                                    <span>{guide.name}</span> / <span>{guide.guide_rating}</span> <StarIcon style={{ color: 'white' }} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </TabPane>
                        }




                        {/* BURADA HEM BTO RET HEM DE ADVISOR RETLER GÖSTERILECEK */}
                        {((role === 'admin') || (role === 'advisor') || (role === 'guide')) &&
                            <TabPane tab={<span className="tour-card-custom-tab-headers" >Reddedilen Turlar</span>} key="4" >
                                {!chosenRejectedTourCard ?
                                    (rejected_tours.length === 0 ? (
                                        <p>Reddedilen tur bulunmamaktadır.</p>
                                    ) : (
                                        rejected_tours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                                            <div key={index} className="tours-tour-card" onClick={() => setChosenRejectedTourCard(tour)}>
                                                <div className="tours-tour-location" style={{ color: 'red' }}>
                                                    {tour.confirmation === "BTO RET" ? "Advisor tarafından reddedildi" : "Yönetim tarafıdan reddedildi"}
                                                </div>
                                                <div className="tours-tour-header">
                                                    <div className="tours-tour-location">
                                                        {tour.city || "Belirtilmemiş"}
                                                    </div>
                                                    <div className="tours-tour-datetime">
                                                        <div className="tours-tour-date">
                                                            <CalendarMonthTwoToneIcon />
                                                            <>
                                                                {new Date(tour.date).toLocaleDateString('tr-TR', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                })}
                                                            </>
                                                        </div>
                                                        <div className="tours-tour-time">
                                                            <AccessTimeTwoToneIcon />
                                                            <>
                                                                {new Date(tour.date).toLocaleTimeString('tr-TR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="tours-tour-body">
                                                    <div className="tours-tour-school">
                                                        {tour.high_school_name}
                                                    </div>
                                                    <div className="tours-tour-details">
                                                        {tour?.student_count} Öğrenci
                                                    </div>
                                                </div>

                                                <div className="tours-tour-footer">
                                                    <div className="tours-tour-rating">
                                                        <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )) : (
                                        <div className="tours-tour-card non-clickable">
                                            <Tooltip title='Geri'>
                                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setChosenRejectedTourCard(null)}>
                                                    <KeyboardBackspaceIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <div className="tours-tour-card-detail-header">{chosenRejectedTourCard.high_school_name}</div>
                                            <div className="tours-tour-card-details">
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Şehir: </div>
                                                    <div>{chosenRejectedTourCard?.city || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                                    <div>{chosenRejectedTourCard?.teacher_name || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                                    <div>{chosenRejectedTourCard?.teacher_phone_number || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                                    <div>{chosenRejectedTourCard?.student_count || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Tarih:</div>
                                                    <div>
                                                        {new Date(chosenRejectedTourCard.date).toLocaleDateString('tr-TR', {
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
                                                        {new Date(chosenRejectedTourCard.date).toLocaleTimeString('tr-TR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Misafir Notu: </div>
                                                    <div>{chosenRejectedTourCard?.notes || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Okula iletilen Red Notu: </div>
                                                    <div>{chosenRejectedTourCard?.feedback || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                            </div>
                                        </div>
                                    )}
                            </TabPane>
                        }





                        {/* GEÇMİŞ TURLAR */}
                        {((role === 'admin') || (role === 'advisor') || (role === 'guide')) &&
                            <TabPane tab={<span className="tour-card-custom-tab-headers" >Geçmiş Turlar</span>} key="5" >
                                {!chosenPastTourCard ?
                                    (previousTours.length === 0 ? (
                                        <p>Geçmiş bilgisi bulunamadı.</p>
                                    ) : (
                                        previousTours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                                            <div key={index} className="tours-tour-card" onClick={() => setChosenPastTourCard(tour)}>
                                                <div className="tours-tour-header">
                                                    <div className="tours-tour-location">
                                                        {tour.city || "Belirtilmemiş"}
                                                    </div>
                                                    <div className="tours-tour-datetime">
                                                        <div className="tours-tour-date">
                                                            <CalendarMonthTwoToneIcon />
                                                            <>
                                                                {new Date(tour.date).toLocaleDateString('tr-TR', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                })}
                                                            </>
                                                        </div>
                                                        <div className="tours-tour-time">
                                                            <AccessTimeTwoToneIcon />
                                                            <>
                                                                {new Date(tour.date).toLocaleTimeString('tr-TR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="tours-tour-body">
                                                    <div className="tours-tour-school">
                                                        {tour.high_school_name}
                                                    </div>
                                                    <div className="tours-tour-details">
                                                        {tour?.student_count} Öğrenci
                                                    </div>
                                                </div>

                                                <div className="tours-tour-footer">
                                                    <div className="tours-tour-rating">
                                                        <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )) : (
                                        <div className="tours-tour-card non-clickable">
                                            <Tooltip title='Geri'>
                                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setChosenPastTourCard(null)}>
                                                    <KeyboardBackspaceIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <div className="tours-tour-card-detail-header">{chosenPastTourCard.high_school_name}</div>
                                            <div className="tours-tour-card-details">
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Şehir: </div>
                                                    <div>{chosenPastTourCard?.city || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                                    <div>{chosenPastTourCard?.teacher_name || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                                    <div>{chosenPastTourCard?.teacher_phone_number || 'Belirtilmemiş'}</div>

                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                                    <div>{chosenPastTourCard?.student_count || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Tarih:</div>
                                                    <div>
                                                        {new Date(chosenPastTourCard.date).toLocaleDateString('tr-TR', {
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
                                                        {new Date(chosenPastTourCard.date).toLocaleTimeString('tr-TR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Not: </div>
                                                    <div>{chosenPastTourCard?.notes || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <br />
                                                <div className="tour-card-detail-format">
                                                    <div className="tour-card-detail-format2">Atanmış Rehberler: </div>
                                                    <div className="requests">
                                                        {chosenTourAssignedGuides.filter(guide => guide.tour_id === chosenPastTourCard.id).map(guide => (
                                                            <div key={guide.id} className="guide-tag assigned">
                                                                <div>
                                                                    <span>{guide.name}</span> / <span>{guide.guide_rating}</span> <StarIcon style={{ color: 'white' }} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </TabPane>
                        }

                    </Tabs>
                }
            </div >
        </>
    );
};

export default TourCard;