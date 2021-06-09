import './App.css';
import React from "react";
import {Switch, Route, useHistory} from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard'
import { Layout} from 'antd';
const { Footer } = Layout;


function App() {
    const history = useHistory();

    return (
        <div>
            <Switch>
                <Route path="/" component={Dashboard}/>
            </Switch>
            <Footer style={{ textAlign: 'center' }}>Polk4 - PolkaDOT viewer | <a href="https://nickshulhin.com">nickshulhin.com</a></Footer>
        </div>
    );
}

export default App;
