import React from 'react';
import 'rsuite/dist/styles/rsuite-default.css';
import { Button } from 'rsuite';
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import SiriusAdapter from '@edgarjeremy/sirius.adapter';
import './App.css';

import Login from './pages/public/Login';
import Dashboard from './pages/dashboard';
import Loading from './components/Loading';

const adapter = new SiriusAdapter(process.env.REACT_APP_API_HOST, process.env.REACT_APP_API_PORT, localStorage);

class App extends React.Component {
  state = {
    ready: false,
    models: null,
    authProvider: null
  }
  async componentDidMount() {
    try {
      const models = await adapter.connect();
      const authProvider = await adapter.getAuthProvider();
      this.setState({ ready: true, models: models, authProvider: authProvider });
    } catch (e) {}
  }
  render() {
    const { ready, models, authProvider } = this.state;
    return (
      ready ?
        <Router>
          <Switch>
            <Route exact path="/" render={(p) => <Login models={models} authProvider={authProvider} {...p} />} />
            <Route path="/dashboard" render={(p) => <Dashboard models={models} authProvider={authProvider} {...p} />} />
          </Switch>
        </Router> :
        <Loading />
    );
  }
}

export default App;
