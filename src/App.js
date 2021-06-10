import './App.css';
import React from "react";
import {Switch, Route, useHistory} from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard'
import { Layout, Menu, Typography} from 'antd';
const { Header, Footer } = Layout;
const { Title } = Typography;


function App() {
    const history = useHistory();

    return (
        <div>
            <Header className="header">
                <Title style={{ color: 'white', paddingTop: 15 }} level={4}>POLK4 NET</Title>
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
