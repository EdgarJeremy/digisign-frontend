import React from 'react';
import { Form, FormGroup, ControlLabel, FormControl, Divider, IconButton, Icon, Schema, Loader, Alert, CheckPicker, SelectPicker } from 'rsuite';

export default class AddFlow extends React.Component {
    state = {
        formValue: {
            name: ''
        },
        roles: [],
        chain: [undefined],
        ready: false,
        loading: false
    }
    async componentDidMount() {
        const { models } = this.props;
        const roles = await models.Role.collection({ attributes: ['id', 'name'] });
        setTimeout(() => {
            this.setState({ roles: roles.rows, ready: true });
        }, 500);
    }
    handleChange(value) {
        this.setState({
            formValue: value
        });
    }
    async onSubmit(e) {
        const { formValue, chain, roles } = this.state;
        const { models } = this.props;
        e.preventDefault();
        if (!this.form.check()) {
            return;
        }
        this.setState({ loading: true });
        formValue.chain = chain.filter((c) => !!c);
        const newFlow = await models.Flow.create(formValue);
        this.setState({
            loading: false,
            roles: [],
            chain: [undefined],
            formValue: {
                name: ''
            }
        }, () => {
            Alert.success('Alur berhasil ditambah');
            this.props.onSuccess && this.props.onSuccess();
        });
    }
    onRemoveChain(idx) {
        const { chain } = this.state;
        chain.splice(idx, 1);
        this.setState({ chain });
    }
    onChangeChain(idx, val) {
        const { chain } = this.state;
        chain[idx] = val;
        this.setState({ chain });
    }
    onAddChain() {
        const { chain } = this.state;
        chain.push(undefined);
        this.setState({ chain });
    }
    render() {
        const { ready, formValue, loading, roles, chain } = this.state;
        const model = Schema.Model({
            name: Schema.Types.StringType().isRequired('Isi nama')
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
                        <ControlLabel>Pembuat Surat</ControlLabel>
                        <FormControl placeholder="peran" accepter={CheckPicker} data={roles.map((r) => ({ label: r.name, value: r.id }))} name="senders" block />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>Alur (Tanpa Pembuat Surat)</ControlLabel>
                        <div>
                            {chain.map((c, i) => (
                                <div key={i} style={{ marginBottom: 2, display: 'inline-block', width: '100%' }}>
                                    <SelectPicker value={chain[i]} onChange={(v) => this.onChangeChain(i, v)} style={{ width: '90%', display: 'inline-block' }} placeholder={`Alur #${i + 1}`} data={roles.map((r) => ({ label: r.name, value: r.id }))} name="chain" block />
                                    <IconButton href="javascript:void(0)" disabled={chain.length === 1} onClick={() => chain.length === 1 ? undefined : this.onRemoveChain(i)} style={{ width: '10%', display: 'inline-block' }} loading={loading} type="submit" color="red" icon={<Icon icon="trash" />} placement="left" />
                                </div>
                            ))}
                            <IconButton href="javascript:void(0)" onClick={this.onAddChain.bind(this)} loading={loading} type="submit" color="green" icon={<Icon icon="plus" />} placement="left" />
                        </div>
                    </FormGroup>
                    <Divider />
                    <IconButton loading={loading} type="submit" color="blue" icon={<Icon icon="save" />} placement="left">Simpan</IconButton>
                </Form> : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>
                }
            </div>
        );
    }
}