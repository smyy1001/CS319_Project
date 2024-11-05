import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { message } from 'antd';
import { useAuth } from '../../AuthProvider';
import './LoginPage.css';
import { TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from '@mui/material/Link';

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


function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const onFinish = async () => {
        // const userDetailsResult = await Axios.get(`/api/auth/user_type/${user.user_id}`);
        // const userDetails = userDetailsResult.data;
        // localStorage.setItem("userType", userDetails.user_type);
        const success = await login(username, password);
        if (success) {
            message.success('Oturum açıldı!');
            navigate('/home');
        } else {
            message.error('E-mail veya şifre hatalı!');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='login-page-outer-container'>

            <div className='login-page-img-container'>
                <div className='picture'>
                    <div className='overlay'></div>
                    <div className='content'>
                        <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '80px', fontWeight: 'bold' }}>Merhaba!</span><br />
                            <span style={{ fontSize: '60px' }} >Okulunu Bilkent'le tanıştırmak ve çok daha fazlası için kayıt ol!</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className='register-and-login-containers'>

                <div className='login-form-container'>

                    <div className='login-page-form-header'>
                        Meet<span className='bilkent-header-style'>Bilkent</span>
                    </div>

                    <div className='login-form'>
                        <CustomTextField
                            autoComplete="off"
                            label="Kullanıcı Adı ya da e-posta"
                            value={username}
                            fullWidth
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <CustomTextField
                            autoComplete="off"
                            label="Şifre"
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        <CustomButton className="login-form-button" onClick={() => onFinish()}>
                            Giriş Yap
                        </CustomButton>
                    </div>

                    <div className='login-form-footer'>
                        <div className='login-page-footer-outer-cont'>
                            <hr style={{ color: 'black', backgroundColor: 'black', width: '150px', height: '0.1rem' }} />
                            yada
                            <hr style={{ color: 'black', backgroundColor: 'black', width: '150px', height: '0.1rem' }} />
                        </div>

                        <div className='google-login'>
                            <CustomButton>
                                <img className='google-icon' src="/google-icon.svg" alt="Continue with Google" />
                                <div style={{ color: 'black' }}>Google ile Devam Et</div>
                            </CustomButton>
                        </div>
                        <br />
                        <Link className='forgot-password' href="/forgot-password" color="inherit">
                            Şifreni mi unuttun?
                        </Link>
                    </div>
                </div>

                <div className='register-link-container'>
                    <div className='register-link'>
                        Hesabın yok mu? <Link className='register-link-class' href="/register" color="inherit">Kayıt Ol!</Link>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default LoginPage;