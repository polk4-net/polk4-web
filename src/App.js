import './App.css';
import {Grommet} from 'grommet'
import React from "react";
import { Switch, Route } from 'react-router-dom';
import Login from './components/Login/Login'

const theme = {
    global: {
        colors: {
            brand: '#FD6FFF',
            accent: '#fc6020',
        },
        font: {
            family: 'Roboto',
            size: '18px',
            height: '20px',
        },
    },
};

function App() {
    return (
        <Grommet theme={theme}>
          <Switch>
            <Route path="/login" component={Login} />
          </Switch>
        </Grommet>
    );
}

export default App;
