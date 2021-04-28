import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, SelectPicker, Divider, IconButton, Icon, Schema, Loader, Alert } from 'rsuite';

export default class AddTypescat extends React.Component {
    state = {
        formValue: {
            name: '',
            type: ''
        },
        ready: false,
        loading: false
    }
    async componentDidMount() {
        const { typescat } = this.props;
        setTimeout(() => {
            this.setState({ ready: true, formValue: typescat.$rawJSON });
        }, 500);
    }
    handleChange(value) {
        this.setState({
            formValue: value
        });
    }
    async onSubmit(e) {
        const { formValue } = this.state;
        const { typescat } = this.props;
        e.preventDefault();
        if (!this.form.check()) {
            return;
        }
        this.setState({ loading: true });
        const editedCategory = await typescat.update(formValue);
        this.setState({
            loading: false,
            formValue: {
                name: '',
                type: ''
            }
        }, () => {
            Alert.success('Kategori berhasil diedit');
            this.props.onSuccess && this.props.onSuccess();
        });
    }
    render() {
        const { ready, formValue, loading } = this.state;
        const model = Schema.Model({
            name: Schema.Types.StringType().isRequired('Isi nama'),
            type: Schema.Types.StringType().isRequired('Isi tipe')
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
                        <ControlLabel>Tipe</ControlLabel>
                        <FormControl placeholder="tipe" accepter={SelectPicker} data={[
                            { l: 'Surat Biasa', v: 'Reguler' },
                            { l: 'Produk Hukum', v: 'Hukum' }
                        ].map((r) => ({ label: r.l, value: r.v }))} name="type" block />
                    </FormGroup>
                    <Divider />
                    <IconButton loading={loading} type="submit" color="blue" icon={<Icon icon="save" />} placement="left">Simpan</IconButton>
                </Form> : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>}
            </div>
        );
    }
}