import React from "react";
import { IconButton } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Tooltip from "@mui/material/Tooltip";
import { useAuth } from "../../AuthProvider";

const Navigation = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <>
            {isAuthenticated && (
                <>
                    <Tooltip title="Çıkış Yap">
                        <IconButton onClick={logout}>
                            <ExitToAppIcon style={{ color: 'black' }} />
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </>
    );
};

export default Navigation;