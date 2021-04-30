import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, ButtonToolbar, Button, Alert } from 'rsuite';
import Loading from '../../components/Loading';

export default class Login extends React.Component {
    state = {
        ready: false,
        formData: {
            username: '',
            password: ''
        },
        loginLoading: false
    }
    async componentDidMount() {
        const { authProvider } = this.props;
        try {
            const user = await authProvider.get();
            this.props.history.replace('/dashboard');
        } catch (e) {
            this.setState({ ready: true });
        }
    }
    updateFormData(key, val) {
        const { formData } = this.state;
        formData[key] = val;
        this.setState({ formData });
    }
    async onSubmit(e) {
        e.preventDefault();
        const { formData } = this.state;
        const { authProvider } = this.props;
        this.setState({ loginLoading: true });
        try {
            const user = await authProvider.set(formData);
            this.props.history.replace('/dashboard');
        } catch (e) {
            Alert.error('Username atau password salah');
        }
        this.setState({ loginLoading: false });
    }
    render() {
        const { ready, loginLoading } = this.state;
        return (
            ready ? <div className="login-container">
                <div className="login-logo">
                    <img src={require('../../images/digisign.png')} />
                </div>
                <div className="login-card">
                    <Form onSubmit={this.onSubmit.bind(this)} fluid>
                        <FormGroup>
                            <ControlLabel>Username</ControlLabel>
                            <FormControl name="name" onChange={(v) => this.updateFormData('username', v)} />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Password</ControlLabel>
                            <FormControl name="password" type="password" onChange={(v) => this.updateFormData('password', v)} />
                        </FormGroup>
                        <FormGroup>
                            <ButtonToolbar>
                                <Button type="submit" appearance="primary" loading={loginLoading} block>Masuk</Button>
                            </ButtonToolbar>
                        </FormGroup>
                    </Form>
                </div>
                <div className="credit">
                    Copyright &copy; {(new Date()).getFullYear()} MaesaLab <br />
                    
                    Photo by <a href="https://www.pexels.com/@goumbik">Lukas</a> from Pexels
                </div>
            </div> :
                <Loading />
        )
    }
}