import React, { useState } from "react";
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { useAuth } from "../../AuthProvider";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import InfoIcon from '@mui/icons-material/Info';
import CollectionsIcon from '@mui/icons-material/Collections';
import Person2Icon from '@mui/icons-material/Person2';
import { useLocation, useNavigate } from 'react-router-dom';
import './Navigation.css'


const StyledMenu = styled(Menu)({
    "& .MuiPaper-root": {
        backgroundColor: "white",
        color: "black",
        border: "1px solid black",
    }
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


const Navigation = () => {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorEl2, setAnchorEl2] = useState(null);
    const open = Boolean(anchorEl);
    const handleNotificationClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuClick = (event) => {
        setAnchorEl2(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl2(null);
    };

    const menuProfileClick = () => {
        navigate("/profile");
        handleMenuClose();
    }

    const menuAboutUsClick = () => {
        navigate("/us");
        handleMenuClose();
    }

    const menuPGalleryClick = () => {
        navigate("/photo_gallery");
        handleMenuClose();
    }


    return (
        <>
            {isAuthenticated && (!location.pathname.startsWith('/register') && location.pathname !== '/login') ? (
                <>
                    <Tooltip title="Bildirimler">
                        <IconButton className='nav-bar-notifications-icon' onClick={handleNotificationClick}>
                            <NotificationsIcon style={{ marginRgiht: '10px' }} /> Bildirimler
                        </IconButton>
                    </Tooltip>

                    <div className="nav-bar-tabs">
                        <Tooltip title="Tüm Turlar Sayfası">
                            <CustomButton className={`nav-bar-tab-button ${location.pathname === '/tours' ? 'selected' : ''}`} onClick={() => navigate('/tours')}>
                                Turlar
                            </CustomButton>
                        </Tooltip>
                        <Tooltip title="Tüm Fairler Sayfası">
                            <CustomButton className={`nav-bar-tab-button ${location.pathname === '/fairs' ? 'selected' : ''}`} onClick={() => navigate('/fairs')}>
                                Fairler
                            </CustomButton>
                        </Tooltip>
                        <Tooltip title="Tüm Rehberler Sayfası">
                            <CustomButton className={`nav-bar-tab-button ${location.pathname === '/guides' ? 'selected' : ''}`} onClick={() => navigate('/guides')}>
                                Rehberler
                            </CustomButton>
                        </Tooltip>
                    </div>

                    <Tooltip title="Menü">
                        <IconButton className="nav-bar-menu-icon" onClick={handleMenuClick}>
                            {Boolean(anchorEl2) ? (<MenuOpenIcon style={{ marginRgiht: '10px' }} />): (<MenuIcon style = {{ marginRgiht: '10px' }} />)}
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={anchorEl2}
                        open={Boolean(anchorEl2)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={menuProfileClick}>
                            <Person2Icon style={{ marginRight: "5px" }} />
                            Profilim
                        </MenuItem>

                        <MenuItem onClick={menuPGalleryClick}>
                            <CollectionsIcon style={{ marginRight: "5px" }} />
                            Foto Galeri
                        </MenuItem>

                        <MenuItem onClick={menuAboutUsClick}>
                            <InfoIcon style={{ marginRight: "5px" }} />
                            Hakkımızda
                        </MenuItem>
                    </Menu>


                    <Tooltip title="Çıkış Yap">
                        <CustomButton className="nav-bar-logout-button" onClick={logout}>
                            Çıkış Yap <ArrowRightAltIcon style={{ marginLeft: '10px' }} />
                        </CustomButton>
                    </Tooltip>
                </>
            ) : (
                <div className="outer-nav-bar-tabs">
                    <Tooltip title="Foto Galeri">
                        <CustomButton className="outer-nav-bar-tab-button" onClick={() => navigate('/photo_gallery')}>
                            Foto Galeri
                        </CustomButton>
                    </Tooltip>
                    <Tooltip title="Hakkımızda">
                        <CustomButton className="outer-nav-bar-tab-button" onClick={() => navigate('/us')}>
                            Hakkımızda
                        </CustomButton>
                    </Tooltip>
                </div>
            )}

            <StyledMenu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>Bildirim 1</MenuItem>
                <MenuItem onClick={handleClose}>Bildirim 2</MenuItem>
                <MenuItem onClick={handleClose}>Daha Fazla...</MenuItem>
            </StyledMenu>
        </>
    );
};

export default Navigation;

