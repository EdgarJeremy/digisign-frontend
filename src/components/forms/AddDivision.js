import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, SelectPicker, Divider, IconButton, Icon, Schema, Loader, Alert } from 'rsuite';

export default class AddDivision extends React.Component {
    state = {
        formValue: {
            name: '',
            asst: ''
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
        const { models } = this.props;
        e.preventDefault();
        if (!this.form.check()) {
            return;
        }
        this.setState({ loading: true });
        const newDivision = await models.Division.create(formValue);
        this.setState({
            loading: false,
            formValue: {
                name: '',
                asst: ''
            }
        }, () => {
            Alert.success('Dinas berhasil ditambah');
            this.props.onSuccess && this.props.onSuccess();
        });
    }
    render() {
        const { ready, formValue, divisions, loading } = this.state;
        const model = Schema.Model({
            name: Schema.Types.StringType().isRequired('Isi nama'),
            asst: Schema.Types.StringType().isRequired('Isi keasistenan'),
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
                        <ControlLabel>Keasistenan</ControlLabel>
                        <FormControl placeholder="keasistenan" accepter={SelectPicker} data={[
                            'Asisten 1',
                            'Asisten 2',
                            'Asisten 3'
                        ].map((r) => ({ label: r, value: r }))} name="asst" block />
                    </FormGroup>
                    <Divider />
                    <IconButton loading={loading} type="submit" color="blue" icon={<Icon icon="save" />} placement="left">Simpan</IconButton>
                </Form> : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>}
            </div>
        );
    }
}