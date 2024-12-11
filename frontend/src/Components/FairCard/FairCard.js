import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import './FairCard.css';
import Axios from '../../Axios';
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CalendarMonthTwoToneIcon from '@mui/icons-material/CalendarMonthTwoTone';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Tabs, message, Input, Select, ConfigProvider, DatePicker, TimePicker } from 'antd';
import trTR from 'antd/lib/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

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

const FairCard = ({ role, fairs, setFairs, setChosenFair, chosenFair, setUpdateGuides, updateGuides }) => {

    const [allGuides, setAllGuides] = useState([]);
    const [fairGuides, setFairGuides] = useState([]);
    const [chosenFairAssignedGuides, setChosenFairAssignedGuides] = useState([]);
    const [chosenFairRequestedGuides, setChosenFairRequestedGuides] = useState([]);
    const [activeTab, setActiveTab] = useState("1");
    const [pending_fairs, setPendingFairs] = useState([]);
    const [bto_onay_fairs, setBTOOnayFairs] = useState([]);
    const [final_fairs, setFinalFairs] = useState([]);
    const [rejected_fairs, setRejectedFairs] = useState([]);
    const [editedFair, setEditFair] = useState(null);
    const [chosenPendingFairCard, setChosenPendingFairCard] = useState(null);
    const [chosenFinalFairCard, setChosenFinalFairCard] = useState(null);
    const [chosenRejectedFairCard, setChosenRejectedFairCard] = useState(null);

    const handleFairCardClick = (id) => {
        setChosenFair(fairs.find(a => a.id === id));
    };

    const handleUpdateGuideClick = () => {
        setUpdateGuides(true);
    };

    const handleRemoveGuideClick = (guideId, fairId) => {
        Axios.delete(`/api/guides_fair/cancel_guides_assigned_fair/${guideId}/${fairId}`)
            .then(() => {
                setFairGuides(fairGuides.filter(fairGuide => fairGuide.id !== guideId));
                getGuides();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const fetchAllFairs = () => {
        Axios.get("/api/fairs/all")
            .then((response) => {
                setFairs(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleAssignGuideClick = (guideId, fairId) => {
        try{   
            Axios.post(`/api/guides_fair/assign_guide/${guideId}/${fairId}`)
                .then((response) => {
                    setFairGuides([...fairGuides, response.data]);
                    getGuides();
                })
                .catch((error) => {
                    console.log(error);
                });
        }  catch (error) {
            console.error("Error assigning guide:", error);
        }
    }

    const handleFinalApproval = (id) => {
        Axios.post(`/api/fairs/sudo/accept_fair/${id}`, {})
            .then(() => {
                fetchAllFairs()
                message.success('Fuar başarıyla onaylandı. Son onay bekleniyor!')
            }
        
            )
            .catch((error) => {
                console.log("sa")
                console.log(error);
            });
        setChosenFair(null);
    }

    const handleFinalReject = (id) => {
        Axios.post(`/api/fairs/sudo/reject_fair/${id}`, {})
            .then(() => {
                fetchAllFairs();
                message.success('Fuar kalıcı olarak reddedildi!')
            }
            )
            .catch((error) => {
                console.log(error);
            });
        setChosenFair(null);
    }


    const handleAdvisorAcceptFair = (id) => {
        Axios.post(`/api/fairs/advisor/accept_fair/${id}`, {})
            .then(() => {
                fetchAllFairs()
                message.success('Fuar başarıyla onaylandı. Son onay bekleniyor!')
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleAdvisorRejectFair = (id) => {
        Axios.post(`/api/fairs/advisor/reject_fair/${id}`, {})
            .then(() => {
                fetchAllFairs();
                message.error('Fuar reddedildi!')
            })
            .catch((error) => {
                console.log(error);
            });
    }


    //get guides
    const getGuides = () => {
        Axios.get('/api/guides_fair/all')
            .then((response) => {
                setFairGuides(response.data);
                // console.log("Fair guidessss", response.data);
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


    // EDIT FAIR INFO
    const handleSaveEditedFair = () => {
        // console.log("SENDED FAIR ", editedFair);
        Axios.patch(`/api/fairs/edit/${editedFair.id}`, editedFair)
            .then((response) => {
                fetchAllFairs();
                console.log("Fair updated successfully:", response.data);
            })
            .catch((error) => {
                console.error("Error updating the fair:", error.response?.data || error.message);
            });
        setChosenFair(editedFair)
        setEditFair(null);
    }
    

    useEffect(() => {
        const assignedGuides = fairGuides
            .filter(fairGuide => fairGuide.status === 'ASSIGNED')
            .map(fairGuide => {
                const guide = allGuides.find(g => g.id === fairGuide.guide_id);
                return guide ? { ...fairGuide, ...guide } : null;  // Combine FairGuide and guide attributes
            })
            .filter(guide => guide);  // Remove any null values
        setChosenFairAssignedGuides(assignedGuides);
        // console.log("asssss", assignedGuides);

        const requestedGuides = fairGuides
            .filter(fairGuide => fairGuide.status === 'REQUESTED')
            .map(fairGuide => {
                const guide = allGuides.find(g => g.id === fairGuide.guide_id);
                return guide ? { ...fairGuide, ...guide } : null;  // Combine fairGuide and guide attributes
            })
            .filter(guide => guide);
        setChosenFairRequestedGuides(requestedGuides);
        // console.log("reqqqq", requestedGuides); 
    }, [allGuides, fairGuides]);

    useEffect(() => {
        setPendingFairs(fairs.filter((fair) => fair.confirmation === 'PENDING'));
    }, [fairs]);

    useEffect(() => {
        setBTOOnayFairs(fairs.filter((fair) => fair.confirmation === 'BTO ONAY'));
    }, [fairs]);

    useEffect(() => {
        setFinalFairs(fairs.filter((fair) => fair.confirmation === 'ONAY'));
    }, [fairs]);

    useEffect(() => {
        setRejectedFairs(fairs.filter((fair) => fair.confirmation === 'RET'));
    }, [fairs]);

    return (
        <>
            <div className="fair-card-tabs-outer-cont" >
                <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={setActiveTab}>
                    {((role === 'admin') || (role === 'advisor') || (role === 'guide')) &&
                    <TabPane tab={<span className="fair-card-custom-tab-headers">Son Onayı Bekleyen Fuarlar</span>} key="1" >
                        {!chosenFair ?
                            (bto_onay_fairs.length === 0 ? (
                                <p>Henüz Onaylanan Fuar yok.</p>
                            ) : (
                                bto_onay_fairs.sort((a, b) => new Date(a.date) - new Date(b.date)).map((fair, index) => (
                                    <div key={index} className="fairs-fair-card" onClick={() => handleFairCardClick(fair.id)}>
                                        <div className="fairs-fair-header">
                                            <div className="fairs-fair-location">
                                                {fair.city || "Belirtilmemiş"}
                                            </div>
                                            <div className="fairs-fair-date">
                                                <CalendarMonthTwoToneIcon />
                                                {new Date(fair.date).toLocaleDateString('tr-TR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>

                                        <div className="fairs-fair-body">
                                            <div className="fairs-fair-school">
                                                {fair.high_school_name}
                                            </div>
                                            <div className="fairs-fair-details">
                                                    {fair?.guide_count} Davetli
                                            </div>
                                        </div>

                                        <div className="fairs-fair-footer">
                                            <div className="fairs-fair-rating">
                                                <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                            </div>
                                            <div className="fairs-fair-guide-info">
                                                {chosenFairAssignedGuides.filter(g => g.fair_id === fair.id).length}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                            ) : (
                                <div className="fairs-fair-card non-clickable" >
                                    {!updateGuides && !editedFair ? (
                                        <>
                                            <Tooltip title='Geri'>
                                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setChosenFair(null)}>
                                                    <KeyboardBackspaceIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <div className="fairs-fair-card-detail-header">{chosenFair.high_school_name}</div>
                                            <div className="fairs-fair-card-details">
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Şehir: </div>
                                                    <div>{chosenFair?.city || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Telefon Numarası: </div>
                                                    <div>{chosenFair?.phone || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">E-posta: </div>
                                                    <div>{chosenFair?.email || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Davetli Sayısı: </div>
                                                    <div>{chosenFair?.guide_count || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Tarih:</div>
                                                    <div>
                                                        {new Date(chosenFair.date).toLocaleDateString('tr-TR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </div>

                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Saat:</div>
                                                    <div>
                                                        {new Date(chosenFair.date).toLocaleTimeString('tr-TR', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Misafir Notu: </div>
                                                    <div>{chosenFair?.notes || 'Belirtilmemiş'}</div>
                                                </div>
                                                <br />
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Atanmış Rehberler ({chosenFairAssignedGuides.filter(guide => guide.fair_id === chosenFair.id).length} / {Math.ceil(chosenFair?.guide_count)}): </div>
                                                    <div className="req-ass-content">
                                                        {chosenFairAssignedGuides.filter(g => g.fair_id === chosenFair.id).map((guide, index) => (
                                                            <span key={guide.id}>
                                                                {guide.name}{index < chosenFairAssignedGuides.length - 1 ? ', ' : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="fairs-fair-card-buttons">
                                            <CustomButton className="fairs-fair-card-button one" onClick={() => setEditFair(chosenFair)}>Düzenle</CustomButton>
                                                    <CustomButton className="fairs-fair-card-button two" onClick={() => handleUpdateGuideClick()}>Rehber Ata / Değiştir</CustomButton>
                                                    <CustomButton className="fairs-fair-card-button three" onClick={() => handleFinalApproval(chosenFair.id)}>Onayla</CustomButton>
                                                    <CustomButton className="fairs-fair-card-button four" onClick={() => handleFinalReject(chosenFair.id)}>Reddet</CustomButton>
                                            </div>
                                        </>
                                    ) : ((!editedFair ? (
                                        <>
                                            <Tooltip title='Geri'>
                                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setUpdateGuides(false)}>
                                                    <KeyboardBackspaceIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <div className="fairs-fair-card-update-guide-update-page-general">
                                                {/* Assigned Guides */}
                                                <div className="fair-card-update-page-assigned">
                                                    <div className="assigned-guides-cont">
                                                        <div className="fairs-fair-card-detail-header">Atanmış Rehberler: {chosenFairAssignedGuides.filter(g => g.fair_id === chosenFair.id).length} / {Math.ceil(chosenFair?.guide_count)}</div>
                                                        <div className="req-ass-content">
                                                            {chosenFairAssignedGuides.filter(guide => guide.fair_id === chosenFair.id).map(guide => (
                                                                <div key={guide.id} className="guide-tag assigned">
                                                                    <div>
                                                                        <span>{guide.name}</span> / <span>{guide.guide_rating}</span> <StarIcon style={{ color: 'white' }} />
                                                                    </div>
                                                                    <div>
                                                                        <Tooltip title='Sil'>
                                                                            <IconButton style={{ color: 'white' }} onClick={() => handleRemoveGuideClick(guide.id, chosenFair.id)}>
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
                                                <div className="fair-card-update-page-req-free">
                                                    <div className="free-req-guides">
                                                        <div className="fairs-fair-card-detail-header">Atanabilecek Rehberler:</div>
                                                        <div className="req-ass-content">
                                                            {allGuides
                                                                .filter(guide => !fairGuides.some(fairGuide => fairGuide.guide_id === guide.id && fairGuide.fair_id === chosenFair.id))
                                                                .map(guide => (
                                                                    <div key={guide.id} className="guide-tag available">
                                                                        <div>
                                                                            <span>{guide.name}</span> / <span>{guide.guide_rating}</span> <StarIcon style={{ color: 'white' }} />
                                                                        </div>
                                                                        <div>
                                                                            {chosenFairAssignedGuides.filter(g => g.fair_id === chosenFair.id).length < Math.ceil(chosenFair.guide_count) &&
                                                                                <Tooltip title='Ekle'>
                                                                                    <IconButton style={{ color: 'white' }} onClick={() => handleAssignGuideClick(guide.id, chosenFair.id)}>
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
                                                        <div className="fairs-fair-card-detail-header">Talep Eden Rehberler:</div>
                                                        <div className="req-ass-content">
                                                            {chosenFairRequestedGuides.filter(guide => guide.fair_id === chosenFair.id).map(guide => (
                                                                <div key={guide.id} className="guide-tag requested">
                                                                    <div>
                                                                        <span>{guide.name}</span> / <span>{guide.guide_rating}</span> <StarIcon style={{ color: 'white' }} />
                                                                    </div>
                                                                    <div>
                                                                        {chosenFairAssignedGuides.filter(g => g.fair_id === chosenFair.id).length < Math.ceil(chosenFair.guide_count) &&
                                                                            <Tooltip title='Ekle'>
                                                                                <IconButton style={{ color: 'white' }} onClick={() => handleAssignGuideClick(guide.id, chosenFair.id)}>
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
                                                <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setEditFair(null)}>
                                                    <KeyboardBackspaceIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <div className="fairs-fair-card-detail-header">{chosenFair.high_school_name}</div>
                                            <div className="fairs-fair-card-details">
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2" style={{ width: '300px' }}>Şehir: </div>
                                                    <Select
                                                        placeholder={chosenFair?.city || 'Belirtilmemiş'}
                                                        style={{ width: 300, backgroundColor: '#f8f9fa' }}
                                                        allowClear
                                                        variant="borderless"
                                                        onChange={(value) => setEditFair({ ...editedFair, city: value })}
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
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Telefon Numarası: </div>
                                                    <Input
                                                        className='fair-card-edit-fair-input'
                                                        placeholder={chosenFair?.phone || 'Belirtilmemiş'}
                                                        variant="borderless"
                                                        type="number"
                                                        onChange={(e) =>
                                                            setEditFair((prev) => ({
                                                                ...prev,
                                                                phone: e.target.value
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">E-Posta: </div>
                                                    <Input
                                                        className='fair-card-edit-fair-input'
                                                        placeholder={chosenFair?.email || 'Belirtilmemiş'}
                                                        variant="borderless"
                                                        onChange={(e) =>
                                                            setEditFair((prev) => ({
                                                                ...prev,
                                                                email: e.target.value
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Davetli Sayısı: </div>
                                                    <Input
                                                        className='fair-card-edit-fair-input'
                                                        placeholder={chosenFair?.guide_count || 'Belirtilmemiş'}
                                                        variant="borderless"
                                                        type="number"
                                                        onChange={(e) =>
                                                            setEditFair((prev) => ({
                                                                ...prev,
                                                                guide_count: e.target.value
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Tarih:</div>
                                                    <ConfigProvider locale={trTR}>
                                                        <DatePicker
                                                            className='fair-card-edit-fair-input'
                                                            type="date"
                                                            placeholder={chosenFair?.date ? new Date(chosenFair.date).toISOString().split('T')[0] : ''}
                                                            onChange={(date) => {
                                                                const updatedDate = new Date(editedFair?.date || new Date());
                                                                if (date) {
                                                                    updatedDate.setFullYear(date.year(), date.month(), date.date());
                                                                }
                                                                setEditFair({ ...editedFair, date: updatedDate.toISOString() });
                                                            }}
                                                            format="YYYY-MM-DD"
                                                            allowClear
                                                            variant="borderless"
                                                        />
                                                    </ConfigProvider>
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Saat:</div>
                                                    <ConfigProvider locale={trTR}>
                                                        <TimePicker
                                                            className='fair-card-edit-fair-input'
                                                            placeholder={new Date(chosenFair.date).toLocaleTimeString('tr-TR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                            format="HH:mm"
                                                            onChange={(time) => {
                                                                const updatedDate = new Date(editedFair?.date || new Date());
                                                                if (time) {
                                                                    updatedDate.setHours(time.hour(), time.minute());
                                                                }
                                                                setEditFair({ ...editedFair, date: updatedDate.toISOString() });
                                                            }}
                                                            allowClear
                                                            variant="borderless"
                                                        />
                                                    </ConfigProvider>
                                                </div>
                                                <br />
                                                <div className="fair-card-detail-format">
                                                    <div className="fair-card-detail-format2">Misafir Notu: </div>
                                                    <Input
                                                        className='fair-card-edit-fair-input'
                                                        placeholder={chosenFair?.notes || 'Belirtilmemiş'}
                                                        allowClear
                                                        variant="borderless"
                                                        onChange={(e) =>
                                                            setEditFair((prev) => ({
                                                                ...prev,
                                                                notes: e.target.value
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <br />
                                            <div className="fairs-fair-card-buttons">
                                                <CustomButton className="fairs-fair-card-button one" onClick={() => setEditFair(null)} >Kaydetmeden Çık</CustomButton>
                                                <CustomButton className="fairs-fair-card-button two" onClick={handleSaveEditedFair} >Kaydet</CustomButton>
                                            </div>
                                        </>
                                    )
                                   
                                )
                                    )} </div>
                            )
                        }
                    </TabPane>
                    }
                    {((role === 'admin') || (role === 'advisor') || (role === 'guide')) &&
                        <TabPane tab={<span className="fair-card-custom-tab-headers" >Son Onayı Almış Fuarlar</span>} key="2" >
                            {!chosenFinalFairCard ?
                                (final_fairs.length === 0 ? (
                                    <p>Fuar başvurusu bulunmamaktadır.</p>
                                ) : (
                                    final_fairs.sort((a, b) => new Date(a.date) - new Date(b.date)).map((fair, index) => (
                                        <div key={index} className="fairs-fair-card" onClick={() => setChosenFinalFairCard(fair)}>
                                            <div className="fairs-fair-header">
                                                <div className="fairs-fair-location">
                                                    {fair.city || "Belirtilmemiş"}
                                                </div>
                                                <div className="fairs-fair-date">
                                                    <CalendarMonthTwoToneIcon />
                                                    {new Date(fair.date).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </div>

                                            <div className="fairs-fair-body">
                                                <div className="fairs-fair-school">
                                                    {fair.high_school_name}
                                                </div>
                                                <div className="fairs-fair-details">
                                                    {fair?.guide_count} Davetli
                                                </div>
                                            </div>

                                            <div className="fairs-fair-footer">
                                                <div className="fairs-fair-rating">
                                                    <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )) : (
                                    <div className="fairs-fair-card non-clickable">
                                        <Tooltip title='Geri'>
                                            <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setChosenFinalFairCard(null)}>
                                                <KeyboardBackspaceIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <div className="fairs-fair-card-detail-header">{chosenFinalFairCard.high_school_name}</div>
                                        <div className="fairs-fair-card-details">
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Şehir: </div>
                                                <div>{chosenFinalFairCard?.city || 'Belirtilmemiş'}</div>

                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Telefon Numarası: </div>
                                                <div>{chosenFinalFairCard?.phone || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">E-posta: </div>
                                                <div>{chosenFinalFairCard?.email || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Davetli Sayısı: </div>
                                                <div>{chosenFinalFairCard?.guide_count || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Tarih:</div>
                                                <div>
                                                    {new Date(chosenFinalFairCard.date).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </div>

                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Saat:</div>
                                                <div>
                                                    {new Date(chosenFinalFairCard.date).toLocaleTimeString('tr-TR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Misafir Notu: </div>
                                                <div>{chosenFinalFairCard?.notes || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <br />
                                            {/* GUIDES ASSIGNED SHOULD BE HERE //! */}
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Atanmış Rehberler: </div>
                                                <div className="requests">
                                                    {chosenFairAssignedGuides.filter(guide => guide.fair_id === chosenFinalFairCard.id).map(guide => (
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

{((role === 'admin') || (role === 'advisor') || (role === 'guide')) &&
                        <TabPane tab={<span className="fair-card-custom-tab-headers" >Onay Bekleyen Fuarlar</span>} key="3" >
                            {!chosenPendingFairCard ?
                                (pending_fairs.length === 0 ? (
                                    <p>Fuar başvurusu bulunmamaktadır.</p>
                                ) : (
                                    <div>
                                        {pending_fairs.sort((a, b) => new Date(a.date) - new Date(b.date)).map((fair, index) => (
                                            <div key={index} className="fairs-fair-card" onClick={() => setChosenPendingFairCard(fair)}>
                                                <div className="fairs-fair-header">
                                                    <div className="fairs-fair-location">
                                                        {fair.city || "Belirtilmemiş"}
                                                    </div>
                                                    <div className="fairs-fair-date">
                                                        <CalendarMonthTwoToneIcon />
                                                        {new Date(fair.date).toLocaleDateString('tr-TR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="fairs-fair-body">
                                                    <div className="fairs-fair-school">
                                                        {fair.high_school_name}
                                                    </div>
                                                    <div className="fairs-fair-details">
                                                        {fair?.guide_count} Davetli
                                                    </div>
                                                </div>

                                                <div className="fairs-fair-footer">
                                                    <div className="fairs-fair-rating">
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
                                    <div className="fairs-fair-card non-clickable">
                                        <Tooltip title='Geri'>
                                            <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setChosenPendingFairCard(null)}>
                                                <KeyboardBackspaceIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <div className="fairs-fair-card-detail-header">{chosenPendingFairCard.high_school_name}</div>
                                        <div className="fairs-fair-card-details">
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Şehir: </div>
                                                <div>{chosenPendingFairCard?.city || 'Belirtilmemiş'}</div>

                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Telefon Numarası: </div>
                                                <div>{chosenPendingFairCard?.phone || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">E-posta: </div>
                                                <div>{chosenPendingFairCard?.email || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Davetli Sayısı: </div>
                                                <div>{chosenPendingFairCard?.guide_count || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Tarih:</div>
                                                <div>
                                                    {new Date(chosenPendingFairCard.date).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </div>

                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Saat:</div>
                                                <div>
                                                    {new Date(chosenPendingFairCard.date).toLocaleTimeString('tr-TR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Misafir Notu: </div>
                                                <div>{chosenPendingFairCard?.notes || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <br />
                                        </div>
                                        <div className="fairs-fair-card-buttons">
                                            <CustomButton className="fairs-fair-card-button one" onClick={() => handleAdvisorAcceptFair(chosenPendingFairCard.id)}>Fuarı Onayla</CustomButton>
                                            <CustomButton className="fairs-fair-card-button two" onClick={() => handleAdvisorRejectFair(chosenPendingFairCard.id)}>Fuarı Reddet</CustomButton>
                                        </div>
                                    </div>
                                )}
                        </TabPane>
                    }

                    {((role === 'admin') || (role === 'advisor') || (role === 'guide')) &&
                        <TabPane tab={<span className="fair-card-custom-tab-headers" >BTO RET</span>} key="4" >
                            {!chosenRejectedFairCard ?
                                (rejected_fairs.length === 0 ? (
                                    <p>Reddedilen Fuar bulunmamaktadır.</p>
                                ) : (
                                    rejected_fairs.sort((a, b) => new Date(a.date) - new Date(b.date)).map((fair, index) => (
                                        <div key={index} className="fairs-fair-card" onClick={() => setChosenRejectedFairCard(fair)}>
                                            <div className="fairs-fair-header">
                                                <div className="fairs-fair-location">
                                                    {fair.city || "Belirtilmemiş"}
                                                </div>
                                                <div className="fairs-fair-date">
                                                    <CalendarMonthTwoToneIcon />
                                                    {new Date(fair.date).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </div>
                                            </div>

                                            <div className="fairs-fair-body">
                                                <div className="fairs-fair-school">
                                                    {fair.high_school_name}
                                                </div>
                                                <div className="fairs-fair-details">
                                                    {fair?.guide_count} Davetli
                                                </div>
                                            </div>

                                            <div className="fairs-fair-footer">
                                                <div className="fairs-fair-rating">
                                                    <span>idk yet</span> <i className="fa fa-star"></i> <StarIcon />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )) : (
                                    <div className="fairs-fair-card non-clickable">
                                        <Tooltip title='Geri'>
                                            <IconButton style={{ margin: '0px', padding: '0px' }} onClick={() => setChosenRejectedFairCard(null)}>
                                                <KeyboardBackspaceIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <div className="fairs-fair-card-detail-header">{chosenRejectedFairCard.high_school_name}</div>
                                        <div className="fairs-fair-card-details">
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Şehir: </div>
                                                <div>{chosenRejectedFairCard?.city || 'Belirtilmemiş'}</div>

                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Telefon Numarası: </div>
                                                <div>{chosenRejectedFairCard?.phone || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">E-posta: </div>
                                                <div>{chosenRejectedFairCard?.email || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Davetli Sayısı: </div>
                                                <div>{chosenRejectedFairCard?.guide_count || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Tarih:</div>
                                                <div>
                                                    {new Date(chosenRejectedFairCard.date).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </div>

                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Saat:</div>
                                                <div>
                                                    {new Date(chosenRejectedFairCard.date).toLocaleTimeString('tr-TR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            <br />
                                            <div className="fair-card-detail-format">
                                                <div className="fair-card-detail-format2">Misafir Notu: </div>
                                                <div>{chosenRejectedFairCard?.notes || 'Belirtilmemiş'}</div>
                                            </div>
                                            <br />
                                        </div>
                                    </div>
                                )}
                        </TabPane>
                    }

                </Tabs>
            </div>
        </>
    );
};

export default FairCard;