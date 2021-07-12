import './App.css';
import React from "react";
import Dashboard from './components/Dashboard/Dashboard'
import {Layout, Menu, Typography, Image} from 'antd';
import logo from './assets/logo.png';

const {Header} = Layout;
const {Title} = Typography;

function App() {
    return (
        <div>
            <Header style={{backgroundColor: '#0f0f0f'}}>
                <Title style={{color: 'white', paddingTop: 15}} level={4}><Image
                    width={40}
                    height={40}
                    preview={false}
                    src={logo}
                />DotView
                </Title>
                <Menu theme="dark" mode="horizontal"/>
            </Header>
            <div style={{backgroundColor: '#ffffff'}}>
                <Dashboard/>
            </div>
        </div>
    );
}

export default App;
