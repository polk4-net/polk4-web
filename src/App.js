import './App.css';
import React from "react";
import {Switch, Route} from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard'
import {Layout, Menu, Typography, Image, Avatar, Comment} from 'antd';
import logo from './assets/logo.png';

const {Header, Footer} = Layout;
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
                />POLK4 NET
                </Title>
                <Menu theme="dark" mode="horizontal"/>
            </Header>
            <Switch>
                <Route path="/" component={Dashboard}/>
            </Switch>
            <div className="card-layout-content-white">
                <Comment
                    author={<a>Nick</a>}
                    avatar={
                        <Avatar
                            src="https://www.nickshulhin.com/images/icon-192.png"
                            alt="Nick"
                        />
                    }
                    content={
                        <p>
                            Thank you for visiting POLK4.net! Just like you I was very excited about the launch of
                            PolkaDOT with all amazing features such as parachains, governance as well solving major
                            transaction fee issues. This project was started as a personal web application with a set of
                            helper tools to make PolkaDOT experience better and faster. I decided to convert it into a
                            product with Opensource core to allow community to participate and implement features which
                            POLK4.net is missing. If you wish to participate in development or simply would like to see
                            how does it work - check out <a href="https://github.com/polk4-net/polk4-web">POLK4.net core
                            which is available on a GitHub</a>. Happy Polking!
                        </p>
                    }
                />
            </div>
            <Footer style={{textAlign: 'center'}}>Polk4 - PolkaDOT viewer | <a
                href="https://nickshulhin.com">nickshulhin.com</a></Footer>
        </div>
    );
}

export default App;
