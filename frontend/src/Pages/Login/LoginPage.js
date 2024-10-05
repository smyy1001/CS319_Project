import React from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, message } from 'antd';
import Axios from '../../Axios';
import './LoginPage.css';

function LoginPage() {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const formData = new FormData();
        formData.append('username', values.username);
        formData.append('password', values.password);

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        try {
            let result = await Axios.post('/api/auth/login', formData, config);
            let accessToken = result.data.access_token;
            localStorage.setItem("token", accessToken);
            Axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;


            try {
                const loginResult = await Axios.get('/api/auth/me');
                const user = loginResult.data;
                localStorage.setItem("userId", user.id);
                localStorage.setItem("user", JSON.stringify(user));

                // const userDetailsResult = await Axios.get(`/api/auth/user_type/${user.user_id}`);
                // const userDetails = userDetailsResult.data;
                // localStorage.setItem("userType", userDetails.user_type);
                localStorage.setItem("userType", 'user')

                message.success('Login successful');
                navigate('/home');
            }
            catch (error) {
                console.error('User info failed', error);
            }

        }
        catch (error) {
            console.error('Login failed', error);
            message.error('Username or password wrong');

        }
    };

    return (
        <div className='login-page-outer-class'>
            <div className='login-page-header'>
                MeetBilkent
            </div>
            <Form
                name="normal_login"
                className="login-form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input placeholder="username" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your Password!' }]}
                >
                    <Input
                        type="password"
                        placeholder="password"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" style={{ width: '100%' }}>
                        Log in
                    </Button>
                </Form.Item>
                <div style={{ textAlign: 'center' }}>
                    Register as:
                    <Link to="/register/school"> School Representative</Link> or
                    <Link to="/register/member"> Member</Link>
                </div>

            </Form>
        </div>
    );
}


export default LoginPage;