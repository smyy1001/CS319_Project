import React from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from '@mui/material/Link';
import './RegisterPage.css';


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


function RegisterPage() {
    const navigate = useNavigate();

    return (
        <div className='register-page-outer-container'>

            <div className='register-page-img-container'>
                <div className='register-picture'>
                    <div className='overlay'></div>
                    <div className='content'>
                        <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '80px', fontWeight: 'bold' }}>Merhaba!</span><br />
                            <span style={{ fontSize: '60px' }} >Okulunu Bilkent'le tanıştırmak ve çok daha fazlası için kayıt ol!</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className='register-choice-containers'>
                <div className='register-container'>

                    <div className='register-page-form-header'>
                        Kayıt<span className='bilkent-header-style'>Ol</span>
                    </div>

                    <div className='register-button-container'>
                        <CustomButton className="register-container-button" onClick={() => navigate('/register/school')} >
                            Okul Kaydı
                        </CustomButton>

                        <CustomButton className="register-container-button" onClick={() => navigate('/register/guide')}>
                            Rehber Öğrenci Kaydı
                        </CustomButton>
                    </div>

                </div>

                <div className='login-link-container'>
                    <div className='login-link'>
                        Zaten Hesabın var mı? <Link className='login-link-class' href="/login" color="inherit">Giriş Yap!</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;