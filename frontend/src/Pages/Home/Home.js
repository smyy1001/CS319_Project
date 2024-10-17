import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Axios from '../../Axios';
import './Home.css';
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import { message } from 'antd';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import styled from "@mui/material/styles/styled";




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

function Home() {
    const [users, setUsers] = useState([]);
    const [editUserId, setEditUserId] = useState(null); // Track the user being edited
    const [password, setPassword] = useState("");

    const fetchUsers = async () => {
        const response = await Axios.get("/api/users/all/");
        setUsers(response.data);
    };

    const onSave = async (id, old) => {
        try {
            const response = await Axios.post(`/api/users/change_password/${id}`, null, {
                params: {
                    old_password: old,
                    new_password: password,
                },
            });
            if (response.status === 200) {
                message.success('Şifre güncellendi!');
                setEditUserId(null); // Close the edit field after saving
            }
        } catch (error) {
            message.error('E-mail veya şifre hatalı!');
        }
    };

    const handleDeleteUser = async (username) => {
        await Axios.delete(`/api/users/delete/username/${username}`);
        fetchUsers();
        await Axios.delete(`/api/guides/delete/email/${username}`);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <Container className="home-main-container">
            <div className="home-content">
                <Typography
                    className="main-big-header"
                    variant="h6"
                    gutterBottom
                    component="div"
                >
                    Users
                </Typography>
                <div>
                    {users.map((user) => (
                        <div key={user.id}>
                            <span>Username: {user.username} </span>
                            <IconButton
                                aria-label="delete"
                                size="small"
                                className="delete-icon"
                                onClick={() => handleDeleteUser(user.username)}
                            >
                                <Tooltip title="Sil">
                                    <DeleteIcon />
                                </Tooltip>
                            </IconButton>
                            {editUserId === user.id ? (
                                <>
                                    <CustomTextField
                                        autoComplete="off"
                                        label="Yeni Şifre"
                                        value={password}
                                        fullWidth
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '40px' }}>
                                        <CustomButton className="login-form-button" style={{ width: '300px' }} onClick={() => onSave(user.id, user.password)}>
                                            Güncelle
                                        </CustomButton>
                                        <CustomButton className="login-form-button" style={{ width: '300px' }} onClick={() => setEditUserId(null)}>
                                            İptal
                                        </CustomButton>
                                    </div>
                                </>
                            ) : (
                                <IconButton
                                    aria-label="edit"
                                    size="small"
                                    className="edit-icon"
                                    onClick={() => setEditUserId(user.id)} // Set the edit state to the user's ID
                                >
                                    <Tooltip title="Edit">
                                        <EditIcon />
                                    </Tooltip>
                                </IconButton>
                            )}
                            <br />
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}

export default Home;