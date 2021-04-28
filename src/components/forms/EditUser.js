import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, SelectPicker, Divider, IconButton, Icon, Schema, Loader, Alert } from 'rsuite';

export default class EditUser extends React.Component {
    state = {
        formValue: {
            name: '',
            username: '',
            password: '',
            type: '',
            division_id: ''
        },
        divisions: [],
        ready: false,
        loading: false
    }
    async componentDidMount() {
        const { models, user } = this.props;
        const divisions = await models.Division.collection({ attributes: ['id', 'name'] });
        setTimeout(() => {
            this.setState({
                divisions: divisions.rows, ready: true, formValue: {
                    ...user.$rawJSON,
                    password: ''
                }
            });
        }, 500);
    }
    handleChange(value) {
        this.setState({
            formValue: value
        });
    }
    async onSubmit(e) {
        const { formValue } = this.state;
        const { user } = this.props;
        e.preventDefault();
        if (!this.form.check()) {
            return;
        }
        this.setState({ loading: true });
        const editedUser = await user.update(formValue);
        this.setState({ loading: false }, () => {
            Alert.success('Pengguna berhasil diedit');
            this.props.onSuccess && this.props.onSuccess();
        });
    }
    render() {
        const { ready, formValue, divisions, loading } = this.state;
        const model = Schema.Model({
            name: Schema.Types.StringType().isRequired('Isi nama'),
            username: Schema.Types.StringType().isRequired('Isi username'),
            type: Schema.Types.StringType().isRequired('Isi peran'),
            division_id: formValue.type === 'SKPD' ? Schema.Types.NumberType().isRequired('Isi dinas') : undefined
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
                        <FormControl placeholder="password (isi hanya jika ingin mengubah)" name="password" type="password" />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Peran</ControlLabel>
                        <FormControl placeholder="peran" accepter={SelectPicker} data={[
                            'Administrator',
                            'SKPD',
                            'Bagian Umum',
                            'Bagian Hukum',
                            'Asisten 1',
                            'Asisten 2',
                            'Asisten 3',
                            'Sekretaris Daerah',
                            'Wakil Bupati',
                            'Bupati'
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