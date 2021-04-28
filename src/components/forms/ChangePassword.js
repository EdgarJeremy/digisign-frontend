import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, SelectPicker, Divider, IconButton, Icon, Schema, Loader, Alert } from 'rsuite';

export default class ChangePassword extends React.Component {
    state = {
        formValue: {
            old_password: '',
            password: '',
            re_password: ''
        },
        ready: false,
        loading: false
    }
    async componentDidMount() {
        const { models } = this.props;
        setTimeout(() => {
            this.setState({ ready: true });
        }, 500);
    }
    handleChange(value) {
        this.setState({
            formValue: value
        });
    }
    async onSubmit(e) {
        const { formValue } = this.state;
        const { models, user } = this.props;
        e.preventDefault();
        if (!this.form.check()) {
            return;
        }
        this.setState({ loading: true });
        const mUser = await models.User.single(user.id);
        try {
            const updated = await mUser.update({
                old_password: formValue.old_password,
                password: formValue.password
            });
            this.setState({
                loading: false,
                formValue: {
                    old_password: '',
                    password: '',
                    re_password: ''
                }
            }, () => {
                Alert.success('Password berhasil diedit');
                this.props.onSuccess && this.props.onSuccess();
            });
        } catch (e) {
            e.errors.map((e) => {
                Alert.error(e.msg);
            });
            this.setState({ loading: false });
        }
    }
    render() {
        const { ready, formValue, loading } = this.state;
        const model = Schema.Model({
            old_password: Schema.Types.StringType().isRequired('Isi password lama'),
            password: Schema.Types.StringType().isRequired('Isi password baru'),
            re_password: Schema.Types.StringType().addRule((v, d) => {
                if (v !== d.password) {
                    return false;
                }
                return true;
            }, 'Password baru tidak cocok').isRequired('Isi ulang password baru')
        });
        return (
            <div>
                {ready ? <Form
                    fluid
                    ref={(form) => this.form = form}
                    model={model}
                    onChange={this.handleChange.bind(this)}
                    formValue={formValue}
                    onSubmit={this.onSubmit.bind(this)}
                >
                    <FormGroup>
                        <ControlLabel>Password Lama</ControlLabel>
                        <FormControl placeholder="Password Lama" name="old_password" type="password" />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Password Baru</ControlLabel>
                        <FormControl placeholder="Password Baru" name="password" type="password" />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Ulangi Password Baru</ControlLabel>
                        <FormControl placeholder="Ulangi Password Baru" name="re_password" type="password" />
                    </FormGroup>
                    <Divider />
                    <IconButton loading={loading} type="submit" color="blue" icon={<Icon icon="save" />} placement="left">Simpan</IconButton>
                </Form> : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>}
            </div>
        );
    }
}