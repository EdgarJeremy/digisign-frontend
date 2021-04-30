import React from 'react';
import { Navbar, Nav, Icon, Container, Header, Content, Button, Modal } from 'rsuite';
import { HashRouter as Router, Route, Link, Switch } from 'react-router-dom';
import New from './New';
import List from './List';
import Loading from '../../components/Loading';
import Division from './Division';
import Typescat from './Typescat';
import User from './User';
import Inbox from './Inbox';
import Rejected from './Rejected';
import Approved from './Approved';
import ChangePassword from '../../components/forms/ChangePassword';
import Pass from './Pass';
import Role from './Role';
import Flow from './Flow';

const MyLink = React.forwardRef((props, ref) => {
    const { to, ...rest } = props;
    return (
        <Link to={to} {...rest} />
    );
});

const NavLink = props => <Nav.Item componentClass={MyLink} {...props} />;

export default class Dashboard extends React.Component {
    state = {
        ready: false,
        user: null,
        openEditPass: false
    }

    _currentRoute() {
        let path = this.props.location.pathname;
        let thispath = this.props.match.path;
        return path.replace(thispath, '');
    }

    async componentDidMount() {
        const { authProvider } = this.props;
        try {
            const user = await authProvider.get();
            this.setState({ ready: true, user: user });
        } catch (e) {
            this.props.history.replace('/');
        }
    }

    async onLogout() {
        const { authProvider } = this.props;
        try {
            await authProvider.remove();
            this.props.history.replace('/');
        } catch (e) { }
    }

    render() {
        const { ready, user } = this.state;
        return (
            ready ? <div>
                <Container>
                    <Header style={{ backgroundColor: '#ffffff' }}>
                        <div className="contain subtle">
                            <Navbar appearance="subtle">
                                <Navbar.Body>
                                    {(() => {
                                        if (user.type === 'Administrator') {
                                            return (
                                                <Nav>
                                                    <NavLink active={this._currentRoute() === '/' || this._currentRoute() === ''} className="navlink" to={`${this.props.match.path}/`} icon={<Icon icon="peoples-map" />}> Dinas</NavLink>
                                                    <NavLink active={this._currentRoute() === '/users'} className="navlink" to={`${this.props.match.path}/users`} icon={<Icon icon="peoples" />}> Pengguna</NavLink>
                                                    <NavLink active={this._currentRoute() === '/roles'} className="navlink" to={`${this.props.match.path}/roles`} icon={<Icon icon="coincide" />}> Peran</NavLink>
                                                    <NavLink active={this._currentRoute() === '/typescat'} className="navlink" to={`${this.props.match.path}/typescat`} icon={<Icon icon="tag" />}> Tipe & Kategori</NavLink>
                                                    <NavLink active={this._currentRoute() === '/flow'} className="navlink" to={`${this.props.match.path}/flow`} icon={<Icon icon="flow" />}> Alur</NavLink>
                                                </Nav>
                                            )
                                        } else {
                                            return (
                                                <Nav>
                                                    <NavLink active={this._currentRoute() === '/' || this._currentRoute() === ''} className="navlink" to={`${this.props.match.path}/`} icon={<Icon icon="envelope" />}> Buat Surat</NavLink>
                                                    <NavLink active={this._currentRoute() === '/list'} className="navlink" to={`${this.props.match.path}/list`} icon={<Icon icon="envelope-open" />}> Surat Dibuat</NavLink>
                                                    <NavLink active={this._currentRoute() === '/inbox'} className="navlink" to={`${this.props.match.path}/inbox`} icon={<Icon icon="envelope-o" />}> Surat Masuk</NavLink>
                                                    <NavLink active={this._currentRoute() === '/rejected'} className="navlink" to={`${this.props.match.path}/rejected`} icon={<Icon icon="envelope-o" />}> Surat Ditolak</NavLink>
                                                    <NavLink active={this._currentRoute() === '/approved'} className="navlink" to={`${this.props.match.path}/approved`} icon={<Icon icon="envelope-open" />}> Surat Diapprove</NavLink>
                                                    {/* <NavLink active={this._currentRoute() === '/approved'} className="navlink" to={`${this.props.match.path}/approved`} icon={<Icon icon="envelope-open" />}> Surat Diapprove</NavLink> */}
                                                </Nav>
                                            )
                                        }
                                    })()}
                                    <Nav pullRight>
                                        <Nav.Item onClick={() => this.setState({ openEditPass: true })} icon={<Icon icon="lock" />} >Ganti Password</Nav.Item>
                                        <Nav.Item onClick={this.onLogout.bind(this)} icon={<Icon icon="sign-out" />} >Logout</Nav.Item>
                                    </Nav>
                                </Navbar.Body>
                            </Navbar>
                        </div>
                    </Header>
                    <Container>
                        <Content>
                            <div style={{maxWidth: 1200, margin: '0 auto', padding: 14}}>
                                <h4>Hai, {user.name}</h4>
                            </div>
                            {
                                (() => {
                                    if (user.type === 'Administrator') {
                                        return (
                                            <Switch>
                                                <Route exact path={`${this.props.match.path}/`} render={(p) => (<Division {...p} models={this.props.models} />)} />
                                                <Route exact path={`${this.props.match.path}/users`} render={(p) => (<User {...p} models={this.props.models} />)} />
                                                <Route exact path={`${this.props.match.path}/roles`} render={(p) => (<Role {...p} models={this.props.models} />)} />
                                                <Route exact path={`${this.props.match.path}/typescat`} render={(p) => (<Typescat {...p} models={this.props.models} />)} />
                                                <Route exact path={`${this.props.match.path}/flow`} render={(p) => (<Flow {...p} models={this.props.models} />)} />
                                            </Switch>
                                        )
                                    } else {
                                        return (
                                            <Switch>
                                                <Route exact path={`${this.props.match.path}/`} render={(p) => (<New {...p} models={this.props.models} user={this.state.user} />)} />
                                                <Route path={`${this.props.match.path}/list`} render={(p) => (<List {...p} models={this.props.models} user={this.state.user} />)} />
                                                <Route path={`${this.props.match.path}/rejected`} render={(p) => (<Rejected {...p} models={this.props.models} user={this.state.user} />)} />
                                                <Route path={`${this.props.match.path}/inbox`} render={(p) => (<Inbox {...p} models={this.props.models} user={this.state.user} />)} />
                                                {/* <Route path={`${this.props.match.path}/pass`} render={(p) => (<Pass {...p} models={this.props.models} user={this.state.user} />)} /> */}
                                                <Route path={`${this.props.match.path}/approved`} render={(p) => (<Approved {...p} models={this.props.models} user={this.state.user} />)} />
                                            </Switch>
                                        )
                                    }
                                })()
                            }
                        </Content>
                    </Container>
                </Container>
                <Modal show={this.state.openEditPass} onHide={() => this.setState({ openEditPass: false })} size="sm">
                    <Modal.Header>
                        <Modal.Title>Ganti Password</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ChangePassword models={this.props.models} user={this.state.user} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.setState({ openEditPass: false })} appearance="subtle">Tutup</Button>
                    </Modal.Footer>
                </Modal>
            </div> :
                <Loading />
        )
    }
}