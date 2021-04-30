import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, SelectPicker, Divider, IconButton, Icon, Schema, Loader, Alert } from 'rsuite';

export default class AddUser extends React.Component {
    state = {
        formValue: {
            name: '',
            username: '',
            password: '',
            type: '',
            certificate_id: '',
            role_id: '',
            division_id: undefined
        },
        divisions: [],
        roles: [],
        ready: false,
        loading: false
    }
    async componentDidMount() {
        const { models } = this.props;
        const divisions = await models.Division.collection({ attributes: ['id', 'name'] });
        const roles = await models.Role.collection({ attributes: ['id', 'name'] });
        setTimeout(() => {
            this.setState({ divisions: divisions.rows, roles: roles.rows, ready: true });
        }, 500);
    }
    handleChange(value) {
        this.setState({
            formValue: value
        });
    }
    async onSubmit(e) {
        const { formValue } = this.state;
        const { models } = this.props;
        e.preventDefault();
        if (!this.form.check()) {
            return;
        }
        this.setState({ loading: true });
        const newUser = await models.User.create(formValue);
        this.setState({
            loading: false,
            formValue: {
                name: '',
                username: '',
                password: '',
                type: '',
                certificate_id: '',
                role_id: '',
                division_id: undefined
            }
        }, () => {
            Alert.success('Pengguna berhasil ditambah');
            this.props.onSuccess && this.props.onSuccess();
        });
    }
    render() {
        const { ready, formValue, divisions, roles, loading } = this.state;
        const model = Schema.Model({
            name: Schema.Types.StringType().isRequired('Isi nama'),
            username: Schema.Types.StringType().isRequired('Isi username'),
            password: Schema.Types.StringType().isRequired('Isi password'),
            type: Schema.Types.StringType().isRequired('Isi tipe'),
            certificate_id: Schema.Types.StringType(),
            type: Schema.Types.StringType().isRequired('Isi tipe'),
            division_id: formValue.type === 'SKPD' ? Schema.Types.NumberType().isRequired('Isi dinas') : undefined,
            role_id: Schema.Types.NumberType().isRequired('Isi peran')
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
                        <ControlLabel>Nama</ControlLabel>
                        <FormControl placeholder="nama" name="name" />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Username</ControlLabel>
                        <FormControl placeholder="username" name="username" />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Password</ControlLabel>
                        <FormControl placeholder="password" name="password" type="password" />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>ID Sertifikat</ControlLabel>
                        <FormControl placeholder="ID sertifikat" name="certificate_id" />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Peran</ControlLabel>
                        <FormControl placeholder="peran" accepter={SelectPicker} data={roles.map((r) => ({ label: r.name, value: r.id }))} name="role_id" block />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Tipe</ControlLabel>
                        <FormControl placeholder="tipe" accepter={SelectPicker} data={[
                            'Administrator',
                            'SKPD',
                            'General'
                        ].map((r) => ({ label: r, value: r }))} name="type" block />
                    </FormGroup>
                    {formValue.type === 'SKPD' && <FormGroup>
                        <ControlLabel>Dinas</ControlLabel>
                        <FormControl placeholder="dinas" accepter={SelectPicker} data={divisions.map((d) => ({ label: d.name, value: d.id }))} name="division_id" block />
                    </FormGroup>}
                    <Divider />
                    <IconButton loading={loading} type="submit" color="blue" icon={<Icon icon="save" />} placement="left">Simpan</IconButton>
                </Form> : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>}
            </div>
        );
    }
}