import React, { useState } from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ProgressBar } from 'react-bootstrap';
import TextField from '@mui/material/TextField';
import './GuideRegister.css';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Axios from '../../../Axios';
import { useNavigate } from "react-router-dom";
import { message } from 'antd';
import { InputAdornment, IconButton } from '@mui/material';

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


const CustomTextField = styled(TextField)({
    "& .MuiInput-underline:after": {
        borderBottomColor: "black",
    },
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            borderColor: "black",
        },
        "&:hover fieldset": {
            borderColor: "black",
        },
        "&.Mui-focused fieldset": {
            borderColor: "black !important",
        },
        "& input:valid:focus + fieldset": {
            borderColor: "black !important",
        },
    },
    "& .MuiFilledInput-root": {
        "&:before": {
            borderBottomColor: "black",
        },
        "&:hover:before": {
            borderBottomColor: "black",
        },
        "&:after": {
            borderBottomColor: "black",
        },
        "&:hover fieldset": {
            borderColor: "black",
        },
        "&.Mui-focused fieldset": {
            borderColor: "black",
        },
    },
    "& label.Mui-focused": {
        color: "black",
    },
    "& label": {
        color: "black",
    },
    "& .MuiInputBase-root": {
        "&::selection": {
            backgroundColor: "rgba(255, 255, 255, 0.99)",
            color: "#241b19",
        },
        "& input": {
            caretColor: "black",
        },
    },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "black !important",
    },
    "& .MuiInputBase-input::selection": {
        backgroundColor: "rgba(255, 255, 255, 0.99)",
        color: "#241b19",
    },
});


function GuideRegister() {
    const [step, setStep] = useState(1);
    const [guide, setGuide] = useState({ "name": '', "password": '', "phone": '', "email": '', "notes": '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleNextStep = () => {
        if (step < 3) {
            setStep(step + 1);
        }
    };

    const handleSave = async () => {
        // if (step < 3) {
        //     setStep(step + 1);
        // }
        // make the backend request here with the inputs
        if (guide.username !== '' && guide.password !== '' && guide.name !== '' && guide.email !== '' && guide.phone !== '') {
            try {
                const response = await Axios.post('/api/guides/add', guide);
                const user = { "id": response.data.id, "username": guide.email, "password": guide.password };
                const response2 = await Axios.post('/api/users/add', user);
                console.log(response);
                console.log(response2);
                clearForm();
                message.success('Rehber başarıyla kaydedildi!');
                navigate('/login');
            } catch (error) {
                if (error.response && error.response.data && error.response.data.detail) {
                    message.error(error.response.data.detail);
                } else {
                    message.error("Rehber kaydedilemedi");
                }
            }
        }
        else {
            message.error('Lütfen tüm alanları doldurun!');
        }
        console.log(guide);
    };

    const handlePreviousStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const progressPercentage = (step / 3) * 100;


    const clearForm = () => {
        setGuide({ "name": '', "password": '', "phone": '', "email": '', "notes": '' });
    }

    return (
        <div className='guide-register-page-outer-container'>
            <div className='guide-register-div1'>
                <ProgressBar className='guide-register-progress-bar' now={progressPercentage} label={`${Math.round(progressPercentage)}%`} />
            </div>
            <div className='guide-register-div2'>
                {step === 1 ? (
                    <div>
                        <span className='guide-register-header'>Merhaba!</span>
                    </div>
                ) : (step === 2 ? (
                    <div>
                        <span className='guide-register-header'>İletişim Bilgilerin!</span>
                    </div>
                ) : (
                    <div>
                        <span className='guide-register-header'>Son Birkaç Detay!</span>
                    </div>
                ))}
            </div>
            <div className='guide-register-div3'>
                {step === 1 ? (
                    <div>
                        <span className='guide-register-description'>Aramıza Hoşgeldin! Seni aramızda görmekten çok mutlu ve heycanlıyız, hadi başlayalım!</span>
                    </div>
                ) : (step === 2 ? (
                    <div>
                        <span className='guide-register-description'>E-mail adresinizi onaylamak için gelen kutusunda ya da junk’daki linke tıklayabilirsin.</span>
                        <span className='guide-register-description'> Unutma, mail adresin aynı zamanda kullanıcı adın!</span>
                    </div>
                ) : (
                    <div>
                        <span className='guide-register-description'>Lütfen Ders Programını yükler misin?</span>
                        <span className='guide-register-description'>  Koordinatörüne bırakmak istediğin bir mesaj varsa ekleyebilirsin!</span>
                    </div>
                ))}
            </div>
            <div className='guide-register-div4'>
                {step === 1 ? (
                    <div className='guide-register-form-container'>

                        <CustomTextField
                            autoComplete="off"
                            required
                            label="Adın Soyadın"
                            value={guide.name}
                            fullWidth
                            onChange={(e) => setGuide({ ...guide, "name": e.target.value })}
                        />

                        {/* 
                        <CustomTextField
                            autoComplete="off"
                            label="Soy Adın"
                            value={guide.surname}
                            fullWidth
                            onChange={(e) => setGuide({ ...guide, "surname": e.target.value })}
                        /> */}

                        {/* <CustomTextField
                            autoComplete="off"
                            required
                            label="Kullanıcı Adın"
                            value={guide.username}
                            fullWidth
                            onChange={(e) => setGuide({ ...guide, "username": e.target.value })}
                        /> */}

                        <CustomTextField
                            autoComplete="off"
                            required
                            label="Şifre"
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            value={guide.password}
                            onChange={(e) => setGuide({ ...guide, "password": e.target.value })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                ) : (step === 2 ? (
                    <div>
                        <div className='guide-register-form-container'>
                            <CustomTextField
                                required
                                type="email"
                                autoComplete="off"
                                label="E-posta Adresin"
                                value={guide.email}
                                fullWidth
                                onChange={(e) => setGuide({ ...guide, "email": e.target.value })}
                            />
                            <CustomTextField
                                autoComplete="off"
                                required
                                label="Telefon Numaran"
                                value={guide.phone}
                                fullWidth
                                onChange={(e) => setGuide({ ...guide, "phone": e.target.value })}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className='guide-register-form-container'>

                            image upload??? DERS PROGRAMI?
                            <CustomTextField
                                autoComplete="off"
                                label="Not"
                                multiline
                                rows={3}
                                value={guide.notes}
                                fullWidth
                                onChange={(e) => setGuide({ ...guide, "notes": e.target.value })}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className='guide-register-div5'>

                {step !== 1 && (
                    <CustomButton className="guide-register-button" onClick={handlePreviousStep} disabled={step === 1}>
                        Geri
                    </CustomButton>
                )}
                {step !== 3 ? (
                    <CustomButton className="guide-register-button" onClick={handleNextStep} disabled={step === 4}>
                        İleri
                    </CustomButton>
                ) : (
                    <CustomButton className="guide-register-button" onClick={handleSave} disabled={step === 4}>
                        Kaydet
                    </CustomButton>
                )}
            </div>
        </div>
    );
}

export default GuideRegister;