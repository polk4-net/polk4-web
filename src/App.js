import './App.css';
import React from "react";
import {Switch, Route, useHistory} from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard'
import { Layout, Menu, Typography, Image} from 'antd';
import logo from './assets/logo.png';
const { Header, Footer } = Layout;
const { Title } = Typography;

function App() {
    const history = useHistory();

    return (
        <div>
            <Header style={{ backgroundColor: '#0f0f0f'}} >
                <Title style={{ color: 'white', paddingTop: 15 }} level={4}><Image
                    width={40}
                    height={40}
                    src={logo}
                />POLK4 NET</Title>
                <Menu theme="dark" mode="horizontal"/>
            </Header>
            <Switch>
                <Route path="/" component={Dashboard}/>
            </Switch>
            <Footer style={{ textAlign: 'center' }}>Polk4 - PolkaDOT viewer | <a href="https://nickshulhin.com">nickshulhin.com</a></Footer>
        </div>
    );
}

export default App;
