import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Axios from '../../Axios';
import './Home.css';
import Typography from "@mui/material/Typography";

function Home() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const response = await Axios.get("/api/users/all/");
        setUsers(response.data);
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
                            <span>Username: {user.username} / </span>
                            <span>Password: {user.password}</span>
                            <br />
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}

export default Home;