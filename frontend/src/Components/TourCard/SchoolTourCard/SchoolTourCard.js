import React, { useState, useEffect } from "react";
import { Tabs, message, Input, Select, ConfigProvider, DatePicker, TimePicker } from 'antd';
import './SchoolTourCard.css'
import { Button, Modal, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import Axios from "../../../Axios";
import Tooltip from "@mui/material/Tooltip";
import CalendarMonthTwoToneIcon from '@mui/icons-material/CalendarMonthTwoTone';
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';
import StarIcon from '@mui/icons-material/Star';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import RateReviewIcon from '@mui/icons-material/RateReview';
import Rating from "@mui/material/Rating";
import IconButton from "@mui/material/IconButton";
import trTR from 'antd/lib/locale/tr_TR';
// import dayjs from 'dayjs';
import 'dayjs/locale/tr';

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

const SchoolTourCard = ({ role, pending, upcoming, rejected, previous, fetchAllTours,
    schosenPastTourCard, ssetChosenPastTourCard, schosenPendingTourCard, ssetChosenPendingTourCard,
    schosenUpcomingTourCard, ssetChosenUpcomingTourCard, schosenRejectedTourCard, ssetChosenRejectedTourCard,
    chosenTourAssignedGuides}) => {
    
    const [activeTab, setActiveTab2] = useState("1");
    const [editedTour, setEditTour] = useState(null);
    const details = JSON.parse(localStorage.getItem("details"));

    const setActiveTab = (key) => {
        setActiveTab2(key);
        ssetChosenRejectedTourCard(null);
        ssetChosenPastTourCard(null);
        ssetChosenUpcomingTourCard(null);
        ssetChosenPendingTourCard(null);
    }


    const [previousTours, setPreviousTours] = useState([]);
    // const [schosenPastTourCard, ssetChosenPastTourCard] = useState(null);

    const [pendingTours, setPendingTours] = useState([]);
    // const [sschosenPendingTourCard, sssetChosenPendingTourCard] = useState(null);

    const [upcomingTours, setUpcomingTours] = useState([]);
    // const [schosenUpcomingTourCard, ssetChosenUpcomingTourCard] = useState(null);

    const [rejectedTours, setRejectedTours] = useState([]);
    // const [schosenRejectedTourCard, ssetChosenRejectedTourCard] = useState(null);

    useEffect(() => {
        setPreviousTours(previous.filter((p) => p.high_school_name === details.school_name));
    }, [previous, details]);

    useEffect(() => {
        setPendingTours(pending.filter((p) => p.high_school_name === details.school_name));
    }, [pending, details]);

    useEffect(() => {
        setRejectedTours(rejected.filter((p) => p.high_school_name === details.school_name));
    }, [rejected, details]);

    useEffect(() => {
        setUpcomingTours(upcoming.filter((p) => p.high_school_name === details.school_name));
    }, [upcoming, details]);


    const handleSaveEditedTour = () => {
        // console.log("SENDED TOUR: ", editedTour);
        Axios.patch(`/api/tours/edit/${editedTour.id}`, editedTour)
            .then((response) => {
                fetchAllTours();
                message.succes("Güncelleme başarılı!");
            })
            .catch((error) => {
                message.error("Güncelleme başarısız!");
                console.error("Error updating the tour:", error.response?.data || error.message);
            });
        ssetChosenPendingTourCard(editedTour);
        setEditTour(null);
    }

    // RATE
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(0);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleRatingChange = (event, newValue) => {
        setRating(newValue);
    };

    const handleRateSave = (id, rate) => {
        handleClose();
        rate = rate * 2;
        Axios.post(`/api/guides/rate_guide/${id}?rate=${rate}`)
            .then((response) => {
                message.succes("Değerlendirmeniz kaydedildi!");
            })
            .catch((error) => {
                message.error("Değerlendirme kaydedilemedi!");
                console.log("Error rating the tour:", error.response?.data || error.message);
            });
        setRating(0);
    };


    return (
        <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={setActiveTab}>

            {/* PENDING REQS */}
            <TabPane tab={<span className="tour-card-custom-tab-headers" >Başvurular</span>} key="1" >
                {!schosenPendingTourCard ?
                    (pendingTours.length === 0 ? (
                        <p>Başvuru bulunamadı.</p>
                    ) : (
                        pendingTours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                            <div key={index} className="tours-tour-card" onClick={() => ssetChosenPendingTourCard(tour)}>
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
                        editedTour ? (
                            <>
                                <Tooltip title='Geri'>
                                    <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setEditTour(null)}>
                                        <KeyboardBackspaceIcon />
                                    </IconButton>
                                </Tooltip>

                                <div className="tours-tour-card-detail-header">{schosenPendingTourCard.high_school_name}</div>
                                <div className="tours-tour-card-details">
                                    <div className="tour-card-detail-format">
                                        <div className="tour-card-detail-format2" style={{ width: '300px' }}>Şehir: </div>
                                        <Select
                                            placeholder={schosenPendingTourCard?.city || 'Belirtilmemiş'}
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
                                            placeholder={schosenPendingTourCard?.teacher_name || 'Belirtilmemiş'}
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
                                            placeholder={schosenPendingTourCard?.teacher_phone_number || 'Belirtilmemiş'}
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
                                            placeholder={schosenPendingTourCard?.student_count || 'Belirtilmemiş'}
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
                                                placeholder={schosenPendingTourCard?.date ? new Date(schosenPendingTourCard.date).toISOString().split('T')[0] : ''}
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
                                                placeholder={new Date(schosenPendingTourCard.date).toLocaleTimeString('tr-TR', {
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
                                        <div className="tour-card-detail-format2">Not: </div>
                                        <Input
                                            className='tour-card-edit-tour-input'
                                            placeholder={schosenPendingTourCard?.notes || 'Belirtilmemiş'}
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
                        ) : (
                            <div className="tours-tour-card non-clickable">
                                <Tooltip title='Geri'>
                                    <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => ssetChosenPendingTourCard(null)}>
                                        <KeyboardBackspaceIcon />
                                    </IconButton>
                                </Tooltip>
                                <div className="tours-tour-card-detail-header">{schosenPendingTourCard.high_school_name}</div>
                                <div className="tours-tour-card-details">
                                    <div className="tour-card-detail-format">
                                        <div className="tour-card-detail-format2">Şehir: </div>
                                        <div>{schosenPendingTourCard?.city || 'Belirtilmemiş'}</div>

                                    </div>
                                    <br />
                                    <div className="tour-card-detail-format">
                                        <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                        <div>{schosenPendingTourCard?.teacher_name || 'Belirtilmemiş'}</div>

                                    </div>
                                    <br />
                                    <div className="tour-card-detail-format">
                                        <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                        <div>{schosenPendingTourCard?.teacher_phone_number || 'Belirtilmemiş'}</div>

                                    </div>
                                    <br />
                                    <div className="tour-card-detail-format">
                                        <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                        <div>{schosenPendingTourCard?.student_count || 'Belirtilmemiş'}</div>
                                    </div>
                                    <br />
                                    <div className="tour-card-detail-format">
                                        <div className="tour-card-detail-format2">Tarih:</div>
                                        <div>
                                            {new Date(schosenPendingTourCard.date).toLocaleDateString('tr-TR', {
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
                                            {new Date(schosenPendingTourCard.date).toLocaleTimeString('tr-TR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <br />
                                    <div className="tour-card-detail-format">
                                        <div className="tour-card-detail-format2">Not: </div>
                                        <div>{schosenPendingTourCard?.notes || 'Belirtilmemiş'}</div>
                                    </div>
                                    <br />
                                </div>
                                <div className="tours-tour-card-buttons">
                                    <CustomButton className="tours-tour-card-button one" onClick={() => setEditTour(schosenPendingTourCard)}>Düzenle</CustomButton>
                                </div>
                            </div >
                        )
                    )}
            </TabPane>


            {/* UPCOMING TOURS */}
            <TabPane tab={<span className="tour-card-custom-tab-headers" >Onaylanan Başvurular</span>} key="2" >
                {!schosenUpcomingTourCard ?
                    (upcomingTours.length === 0 ? (
                        <p>Geçmiş bilgisi bulunamadı.</p>
                    ) : (
                        upcomingTours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                            <div key={index} className="tours-tour-card" onClick={() => ssetChosenUpcomingTourCard(tour)}>
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
                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => ssetChosenUpcomingTourCard(null)}>
                                    <KeyboardBackspaceIcon />
                                </IconButton>
                            </Tooltip>
                            <div className="tours-tour-card-detail-header">{schosenUpcomingTourCard.high_school_name}</div>
                            <div className="tours-tour-card-details">
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Şehir: </div>
                                    <div>{schosenUpcomingTourCard?.city || 'Belirtilmemiş'}</div>

                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                    <div>{schosenUpcomingTourCard?.teacher_name || 'Belirtilmemiş'}</div>

                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                    <div>{schosenUpcomingTourCard?.teacher_phone_number || 'Belirtilmemiş'}</div>

                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                    <div>{schosenUpcomingTourCard?.student_count || 'Belirtilmemiş'}</div>
                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Tarih:</div>
                                    <div>
                                        {new Date(schosenUpcomingTourCard.date).toLocaleDateString('tr-TR', {
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
                                        {new Date(schosenUpcomingTourCard.date).toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Not: </div>
                                    <div>{schosenUpcomingTourCard?.notes || 'Belirtilmemiş'}</div>
                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Bilkent Onay Notu: </div>
                                    <div>{schosenUpcomingTourCard?.feedback || 'Belirtilmemiş'}</div>
                                </div>
                                <br />
                            </div>
                        </div>
                    )}
            </TabPane>


            {/* REJECTED TOURS */}
            <TabPane tab={<span className="tour-card-custom-tab-headers" >Reddedilen Başvurular</span>} key="3" >
                {!schosenRejectedTourCard ?
                    (rejectedTours.length === 0 ? (
                        <p>Reddedilen başvuru bulunamadı.</p>
                    ) : (
                        rejectedTours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                            <div key={index} className="tours-tour-card" onClick={() => ssetChosenRejectedTourCard(tour)}>
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
                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => ssetChosenRejectedTourCard(null)}>
                                    <KeyboardBackspaceIcon />
                                </IconButton>
                            </Tooltip>
                            <div className="tours-tour-card-detail-header">{schosenRejectedTourCard.high_school_name}</div>
                            <div className="tours-tour-card-details">
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Şehir: </div>
                                    <div>{schosenRejectedTourCard?.city || 'Belirtilmemiş'}</div>

                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                    <div>{schosenRejectedTourCard?.teacher_name || 'Belirtilmemiş'}</div>

                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                    <div>{schosenRejectedTourCard?.teacher_phone_number || 'Belirtilmemiş'}</div>

                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                    <div>{schosenRejectedTourCard?.student_count || 'Belirtilmemiş'}</div>
                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Tarih:</div>
                                    <div>
                                        {new Date(schosenRejectedTourCard.date).toLocaleDateString('tr-TR', {
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
                                        {new Date(schosenRejectedTourCard.date).toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Not: </div>
                                    <div>{schosenRejectedTourCard?.notes || 'Belirtilmemiş'}</div>
                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Bilkent Ret Notu: </div>
                                    <div>{schosenRejectedTourCard?.feedback || 'Belirtilmemiş'}</div>
                                </div>
                                <br />
                            </div>
                        </div>
                    )}
            </TabPane>


            {/* PAST TOURS */}
            <TabPane tab={<span className="tour-card-custom-tab-headers" >Geçmiş Turlar</span>} key="4" >
                {!schosenPastTourCard ?
                    (previousTours.length === 0 ? (
                        <p>Geçmiş bilgisi bulunamadı.</p>
                    ) : (
                        previousTours.sort((a, b) => new Date(a.date) - new Date(b.date)).map((tour, index) => (
                            <div key={index} className="tours-tour-card" onClick={() => ssetChosenPastTourCard(tour)}>
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
                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => ssetChosenPastTourCard(null)}>
                                    <KeyboardBackspaceIcon />
                                </IconButton>
                            </Tooltip>
                            <div className="tours-tour-card-detail-header">{schosenPastTourCard.high_school_name}</div>
                            <div className="tours-tour-card-details">
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Şehir: </div>
                                    <div>{schosenPastTourCard?.city || 'Belirtilmemiş'}</div>

                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen: </div>
                                    <div>{schosenPastTourCard?.teacher_name || 'Belirtilmemiş'}</div>

                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Sorumlu Öğretmen İletişim: </div>
                                    <div>{schosenPastTourCard?.teacher_phone_number || 'Belirtilmemiş'}</div>

                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Öğrenci Sayısı: </div>
                                    <div>{schosenPastTourCard?.student_count || 'Belirtilmemiş'}</div>
                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Tarih:</div>
                                    <div>
                                        {new Date(schosenPastTourCard.date).toLocaleDateString('tr-TR', {
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
                                        {new Date(schosenPastTourCard.date).toLocaleTimeString('tr-TR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Not: </div>
                                    <div>{schosenPastTourCard?.notes || 'Belirtilmemiş'}</div>
                                </div>
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Bilkent Onay Notu: </div>
                                    <div>{schosenPastTourCard?.feedback || 'Belirtilmemiş'}</div>
                                </div>
                                <br />
                                <br />
                                <div className="tour-card-detail-format">
                                    <div className="tour-card-detail-format2">Kampüs Rehberleri: </div>
                                    <div className="requests">
                                        {chosenTourAssignedGuides.filter(guide => guide.tour_id === schosenPastTourCard.id).map(guide => (
                                            <div key={guide.id} className="guide-tag assigned">
                                                <div>
                                                    <span>{guide.name}</span>
                                                    <Tooltip title="Puanla">
                                                        <IconButton
                                                            style={{ margin: "0px", marginLeft: "10px", padding: "0px", color: "white" }}
                                                            onClick={handleOpen}
                                                        >
                                                            <RateReviewIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Modal
                                                        open={open}
                                                        onClose={handleClose}
                                                        aria-labelledby="rate-guide-modal"
                                                        aria-describedby="rate-guide-modal-description"
                                                    >
                                                        <Box
                                                            sx={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                left: "50%",
                                                                transform: "translate(-50%, -50%)",
                                                                bgcolor: "background.paper",
                                                                borderRadius: 2,
                                                                boxShadow: 24,
                                                                p: 3,
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <h3>Puan Ver</h3>
                                                            <Rating
                                                                name="half-rating"
                                                                value={rating}
                                                                precision={0.5}
                                                                onChange={handleRatingChange}
                                                                size="large"
                                                            />
                                                            <CustomButton
                                                                style={{
                                                                    marginTop: "20px",
                                                                    padding: "8px 16px",
                                                                    backgroundColor: "#1976d2",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius: "5px",
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={() => {
                                                                    handleRateSave(guide.user_id, rating);
                                                                }}
                                                            >
                                                                Kaydet
                                                            </CustomButton>
                                                        </Box>
                                                    </Modal>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
            </TabPane>


        </Tabs>
    );
};

export default SchoolTourCard;

