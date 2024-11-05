import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ProgressBar } from 'react-bootstrap';
import TextField from '@mui/material/TextField';
import './SchoolRegister.css';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Axios from '../../../Axios';
import { useNavigate } from "react-router-dom";
import { message } from 'antd';
import { InputAdornment, IconButton } from '@mui/material';

/**possible improvements and notes
 *  save eklenebilir belki çıkıp geri girerken sümeyyenin dediği gibi :) ama attribute 'value' baya hallediyo gibi, sadece clear lamamak yetiyo aşırı basit bişi oluyor yani
 *  user role eklenebilir field olarak
 *  Guide Register Guide kısmında düzeltilmesi gereken şeyler var, user ı önce kaydedip id sini alıp guide a kaydetmek lazım, şu an tam tersini yapıyoruz ve sorunlu bişi, neden? (assignment :D )
 *  Admin ve Advisor register da eklenmeli ya da rütbe atlatma olmalı ama bence register ekleyebiliriz onlara da, zor bişi değil. 
 * 2 tane password var db de, school admin guides advisors + users, users gerekli diğerleri değil silerken dikkat etkmek gerekiyor ama db den
 *  progress bar düzeltilecek dün vakit yetmedi ona
 *  onun dışında bi sorun/talep olursa yazabilirsiniz, bugün School Application a bakcam inş - O.E.A.
 */
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




const SchoolRegister = () => {
const [showToast, setShowToast] = useState(false);
const [modalMessage, setModalMessage] = useState("");
const [school, setSchool] = useState({"school_name" : "","password":"", "email": "", "city": "","user_name":"","user_role" : "", "user_phone": "","notes" :"" }); // usestate -> inside paranthesis, we have the default value of the 'schoolName'  // use states must be called inside a react component or function
const [step, setStep] = useState(1);
const [password_repeat, setPasswordRepeat] = useState("");
const [passwordVisible, setPasswordVisible] = useState(false);
const navigate = useNavigate();

const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
}


const incStep = () => {
    setStep(step + 1);
}
const decStep =() => {
    setStep(step - 1);
}

const backtoRegisterPage = () => {
    navigate("/register");
}

const handleFirstStepClick = () => {
    if (school.school_name === "" || school.password === "" || password_repeat === ""){
        // pop up -> please fill in the blank boxes
        setModalMessage("Lütfen boş alanları doldurunuz.");
        setShowToast(true);
    }
    else if(school.password.length < 8){
        // pop up, password should be at least 8 characters long
        setModalMessage("Güvenliğiniz için şifreniz en az 8 karakter olmalıdır.");
        setShowToast(true);
    }
    else if( school.password !== password_repeat){
        // pop up, repeated password shoudl match the password entered.
        setModalMessage("Şifreler aynı değil. Lütfen tekrar deneyiniz.");
        setShowToast(true);
    } 
    else{
        incStep();
    }
}

const handleSecondStepClick = () => {
    if(school.email === "" || school.user_phone === ""){
        setModalMessage("Lütfen boş alanları doldurunuz.");
        setShowToast(true);
        
    }
    else if(!school.email.includes('@')){
        setModalMessage("Lütfen geçerli bir email giriniz.");
        setShowToast(true);
        
    }
    else if(!(school.user_phone[0] === '0') || school.user_phone.length !== 11){
        setModalMessage("Lütfen geçerli bir telefon numarası giriniz. örnek: 0 555 555 55 55");
        setShowToast(true); 
        
    }
    else{
        incStep();
    }
}


const onSave = async () => {
    if(school.user_name === "" || school.city === ""){
        setModalMessage("Lütfen boşluklu alanları doldurun.");
        setShowToast(true);
    }
    else {
        try{

            console.log("school",school);
            var users = {"username"  : school.email, "password" : school.password};
            const response2 = await Axios.post("/api/users/add", users);
            console.log("user", users);
            school.id = response2.id;
            const response1 = await Axios.post("/api/schools/add",school);   
            
            console.log(response1.data);
            console.log(response2.data);
            clearForm();

            navigate('/login');
            
        }
        catch(error){
            if (error.response && error.response.data && error.response.data.detail) {
                message.error(error.response.data.detail);
            } else {
                message.error("Okul kaydedilemedi");
            }
        } 
    }

}

const clearForm = () => {
    setSchool({"school_name" : "","password":"", "email": "", "city": "","user_name":"","user_role" : "", "user_phone": "","notes" :"" });
} 

        // Auto-hide the modal after 10 seconds when it appears
        useEffect( () => {
            if(showToast){
                const timer = setTimeout(()=>
                    setShowToast(false),10000
                );
                return ()=> clearTimeout(timer);
            }
        }, [showToast])


    return (
        <>
        <CustomButton className = " geri-dön-btn" style = {{position:"fixed", left:"10px",top:"80px",zIndex: "1050",color:"black"}} onClick = {backtoRegisterPage}>
        
        {/* back arrow svg inside the button */}        
                
                <svg fill="#000000" height="20px" width="20px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" 
	 viewBox="0 0 512 512">
                <g>
	                <g>
		                <g>
			<path d="M0,0v512h512V0H0z M469.333,469.333H42.667V42.667h426.667V469.333z"/>
			<path d="M110.931,243.242c-0.226,0.302-0.461,0.598-0.671,0.913c-0.204,0.304-0.38,0.62-0.566,0.932
				c-0.17,0.285-0.349,0.564-0.506,0.857c-0.17,0.318-0.315,0.646-0.468,0.971c-0.145,0.306-0.297,0.607-0.428,0.921
				c-0.13,0.315-0.236,0.637-0.35,0.957c-0.121,0.337-0.25,0.669-0.354,1.013c-0.097,0.32-0.168,0.646-0.249,0.969
				c-0.089,0.351-0.187,0.698-0.258,1.055c-0.074,0.375-0.118,0.753-0.173,1.13c-0.044,0.311-0.104,0.617-0.135,0.933
				c-0.138,1.4-0.138,2.811,0,4.211c0.031,0.315,0.09,0.621,0.135,0.933c0.054,0.377,0.098,0.756,0.173,1.13
				c0.071,0.358,0.169,0.704,0.258,1.055c0.081,0.324,0.152,0.649,0.249,0.969c0.104,0.344,0.233,0.677,0.354,1.013
				c0.115,0.32,0.22,0.642,0.35,0.957c0.13,0.314,0.283,0.615,0.428,0.921c0.153,0.325,0.297,0.653,0.468,0.971
				c0.157,0.293,0.336,0.572,0.506,0.857c0.186,0.312,0.363,0.628,0.566,0.932c0.211,0.315,0.445,0.611,0.671,0.913
				c0.191,0.255,0.368,0.516,0.571,0.764c0.439,0.535,0.903,1.05,1.392,1.54c0.007,0.008,0.014,0.016,0.021,0.023l85.333,85.333
				c8.331,8.331,21.839,8.331,30.17,0c8.331-8.331,8.331-21.839,0-30.17l-48.915-48.915H384c11.782,0,21.333-9.551,21.333-21.333
				s-9.551-21.333-21.333-21.333H179.503l48.915-48.915c8.331-8.331,8.331-21.839,0-30.17s-21.839-8.331-30.17,0l-85.333,85.333
				c-0.008,0.008-0.014,0.016-0.021,0.023c-0.488,0.49-0.952,1.004-1.392,1.54C111.299,242.726,111.122,242.987,110.931,243.242z"/>
		                </g>
	                </g>
                </g>
                        </svg>
               Geri Dön</CustomButton>

                       
        <div className="school-register-page-outer-container">
           {/* progress bar */}     
            <div className="progress-container" >
                <ProgressBar className="progress-bar">
                    <p style ={{ margin: 0 }} >Devam etmek için tıkla</p>
                </ProgressBar>
            </div>  
            
             {/* Bootstrap-style Modal positioned at bottom-right */}
              {/* Toast Notification */}
            {showToast && (
                <div className="toast toast-bottom-right show" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header">
                        <strong className="mr-auto">Alert</strong>
                        <button type="button" className="ml-2 mb-1 close" onClick={() => setShowToast(false)}>&times;</button>
                    </div>
                    <div className="toast-body">
                        {modalMessage}
                    </div>
                </div>
            )}
            
            {step === 1 ? ( 
                
          
            <div className = "container okul-adi">
                
                <h1>Okulunuzun Adı</h1>
      
                <p>
                Eğer okulunuz sistemimizde zaten kayıtlı ise okulunuzdan başka biri sisteme kayıt olmuş olabilir.
                Okulunuzun kaydıyla alakalı bir sıkıntı olduğunu düşünüyorsanız <span color = "blue">edip.aras@ug.bilkent.edu.tr</span> email adresiyle iletişime geçebilirsiniz
                </p>
                

                
                
                <CustomTextField
                autoComplete = "off"
                required
                label="Okul Adı"
                variant="outlined"
                placeholder= "örn: Kabataş Erkek Lisesi"
                value = {school.school_name}
                fullWidth
                onChange = {(e) => {setSchool({...school, "school_name" : e.target.value})}}
              > </CustomTextField>

            <CustomTextField
                type =  {passwordVisible ? "text" : "password"}
                autoComplete = "off"
                required
                label="Şifre"
                variant="outlined"
                value = {school.password}
                fullWidth
                onChange = {(e) => {setSchool({...school, "password" : e.target.value})}}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={togglePasswordVisibility}
                            >
                                {passwordVisible ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
              > </CustomTextField>
            
            <CustomTextField
                type = {passwordVisible ? "text" : "password"}
                autoComplete = "off"
                required
                label="Şifre Tekrar"
                variant="outlined"
                value = {password_repeat}
                fullWidth
                onChange = {(e) => {setPasswordRepeat(e.target.value)}}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={togglePasswordVisibility}
                            >
                                {passwordVisible ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
              > </CustomTextField>

              
            

              <CustomButton className= "btn yön-btn ileri-btn" style={{ color: "white", marginTop:"10px" }} onClick={handleFirstStepClick} >İleri</CustomButton>
            </div>

                /**
                 * UI Library Handling: In libraries like Material-UI, the fullWidth prop is specifically designed to make the component occupy the full width of its container. When you set fullWidth, the library often applies specific CSS rules and layout adjustments to ensure that the component behaves as expected.

Style Inheritance and Specificity: When you use style={{ width: "100%" }}, it may not always behave as expected, especially if the component has internal styles or if its parent container has specific width constraints. In contrast, fullWidth usually overrides these constraints, ensuring the element takes up all available width in its container
                 */
            ) : step === 2 ? (
                    //  JSX requires conditional expressions to return a single element
                
                
                <div className = "step"> 
                {/** step 2 */}

                <h1>İletişim Bilgileri</h1>
                <p>Email ve ulaşabileceğimiz bir telefon numarası girebilir misiniz?</p>

                <div className = "textfield">
                <CustomTextField 
                className = "textfield-email"
                required
                label="Email Giriniz"
                placeholder = "örn: edip.aras@ug.bilkent.edu.tr"
                style = {{display: "block"}}
                fullWidth
                value = {school.email}
                onChange = {(e)=> {setSchool({...school, "email": e.target.value})}}
                > </CustomTextField>

                <CustomTextField 
                className = "textfield-user-phone"
                required
                label = "Cep Telefonu Giriniz"
                placeholder = "0 XXX XXX XX XX"
                style = {{display: "block"}}
                fullWidth
                value = {school.user_phone}
                onChange = {(e) => {setSchool({...school, "user_phone" : e.target.value})}}
                > </CustomTextField>
                
                </div>
                <div className = "buttons">
                <CustomButton
                className = "btn step-2 geri-btn"
                onClick = {decStep} 
                style = {{display :"inline"}}>
                Geri
                </CustomButton>

                <CustomButton
                className = "btn step-2 ileri-btn"
                onClick = {handleSecondStepClick}
                style = {{display :"inline"}}>
                İleri
                </CustomButton>
                
                </div>
                </div>
                
               
            ): (
                
            <div className = "step"> 
            {/** step 3 */}
           
                <h1>Sizinle İlgili Birkaç Detay</h1>
                <p>Kişisel bilgilerinizi girebilir misiniz?</p>

                <div className = "textfield">
                <CustomTextField 
                className = "textfield-user-name"
                required
                label= "İsim - Soyisim Giriniz"
                placeholder = "örn: Ömer Edip Aras"
                style = {{display: "block"}}
                fullWidth
                value = {school.user_name}
                onChange = {(e)=> {setSchool({...school, "user_name": e.target.value})}}
                > </CustomTextField>

            <CustomTextField 
                className = "textfield-city"
                required
                label = "Şehir"
                placeholder = "örn: Gaziantep"
                style = {{display: "block"}}
                fullWidth
                value = {school.city}
                onChange = {(e) => {setSchool({...school, "city" : e.target.value})}}
                > </CustomTextField>

            <CustomTextField 
                className = "textfield-notes"
                fullWidth
                label = "Notlarınız"
                placeholder = "Notlarınızı buraya yazabilirsiniz.."
                multiline
                rows={3}
                height = "100px"
                value = {school.notes}
                onChange = {(e) => {setSchool({...school, "notes" : e.target.value})}}
                > </CustomTextField>
                 
                </div>
               

                <div className = "buttons">
                <CustomButton
                className = "btn step-2 geri-btn"
                onClick = {decStep} 
                style = {{display :"inline"}}>
                Geri
                </CustomButton>

                <CustomButton
                className = "btn step-2 ileri-btn"
                onClick = {onSave}
                style = {{display :"inline"}}>
                Kaydet
                </CustomButton>
                
                </div>
                </div>


            )
        }
            </div> 
        
        </>)
};

export default SchoolRegister;
