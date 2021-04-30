import React from 'react';
import StepWizard from 'react-step-wizard';
import { Button, Divider, ButtonGroup, Input, Steps, Icon, IconButton, SelectPicker, Loader, Alert } from 'rsuite';

export default class New extends React.Component {
    state = {
        form: {
            title: '',
            type: '',
            file: null,
            category_id: '',
            flow_id: '',
        },
        categories: [],
        flows: [],
        ready: false,
        loading: false
    }
    async componentDidMount() {
        const { models } = this.props;
        const categories = await models.Category.collection({ attributes: ['id', 'name'] });
        const flows = await models.Flow.collection({ attributes: ['name'] });
        this.setState({ ready: true, categories: categories.rows, flows: flows.rows });
    }
    updateForm(key, val) {
        const { form } = this.state;
        form[key] = val;
        this.setState({ form });
    }
    async onSubmit() {
        const { models, user } = this.props;
        const { form } = this.state;
        this.setState({ loading: true });
        delete form.category;
        const letter = await models.Letter.create(form);
        await models.Log.create({
            type: 'APPROVAL',
            note: '',
            letter_id: letter.id,
            user_id: user.id
        });
        this.setState({
            loading: false, form: {
                title: '',
                type: '',
                file: null,
                category_id: '',
                flow_id: ''
            }
        });
        Alert.success(`Surat berhasil disimpan`);
    }
    findCategory(id) {
        const { categories } = this.state;
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].id == id) return categories[i];
        }
        return;
    }
    render() {
        const { form, ready, categories, flows, loading } = this.state;
        form.category = this.findCategory(form.category_id);
        return (
            <div className="contain" style={{ padding: 14 }}>
                <h3>Buat Surat</h3>
                <div className="panel">
                    {ready ? <StepWizard nav={<Nav />}>
                        <Step1 formData={form} flows={flows} updateForm={this.updateForm.bind(this)} />
                        <Step2 formData={form} categories={categories} updateForm={this.updateForm.bind(this)} />
                        <Step3 formData={form} updateForm={this.updateForm.bind(this)} />
                        <Step4 formData={form} updateForm={this.updateForm.bind(this)} />
                        <Step5 formData={form} updateForm={this.updateForm.bind(this)} onSubmit={this.onSubmit.bind(this)} loading={loading} />
                    </StepWizard> : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>}
                </div>
            </div>
        )
    }
}

const Nav = (props) => {
    return (
        <Steps small current={props.currentStep - 1}>
            <Steps.Item style={{ cursor: 1 <= props.currentStep ? 'pointer' : 'not-allowed' }} title="Alur Surat" description="Pilih alur surat" onClick={() => 1 < props.currentStep && props.goToStep(1)} />
            <Steps.Item style={{ cursor: 2 <= props.currentStep ? 'pointer' : 'not-allowed' }} title="Kategori Surat" description="Kategori surat sesuai tipe" onClick={() => 2 < props.currentStep && props.goToStep(2)} />
            <Steps.Item style={{ cursor: 3 <= props.currentStep ? 'pointer' : 'not-allowed' }} title="Judul Surat" description="Judul surat sesuai maksud" onClick={() => 3 < props.currentStep && props.goToStep(3)} />
            <Steps.Item style={{ cursor: 4 <= props.currentStep ? 'pointer' : 'not-allowed' }} title="Upload File" description="Softcopy surat dalam bentuk file ms-word (.docx)" onClick={() => 4 < props.currentStep && props.goToStep(4)} />
            <Steps.Item style={{ cursor: 5 <= props.currentStep ? 'pointer' : 'not-allowed' }} title="Tinjauan" description="Tinjau pengisian" onClick={() => { }} />
        </Steps>
    );
};

const Step1 = (props) => {
    return (
        <div className="wizard-step">
            <div className="wizard-question">
                Pilih alur surat
            </div>
            <div className="wizard-form">
                <SelectPicker value={props.formData.flow_id} placeholder="Pilih alur" block data={props.flows.map((c) => ({ label: `${c.name} (${c.flow_chains.map((c) => c.role.name).join(' → ')})`, value: c.id }))} onChange={(v) => props.updateForm('flow_id', v)} />
            </div>
            <div className="wizard-action">
                <IconButton disabled={!props.formData.flow_id} onClick={props.nextStep} icon={<Icon icon="angle-right" />} appearance="primary" size="lg" circle />
            </div>
        </div>
    )
}
const Step2 = (props) => {
    return (
        <div className="wizard-step">
            <div className="wizard-question">
                Apa kategori surat yang akan dibuat?
            </div>
            <div className="wizard-form">
                <SelectPicker value={props.formData.category_id} placeholder="Pilih kategori" block data={props.categories.map((c) => ({ label: c.name, value: c.id }))} onChange={(v) => props.updateForm('category_id', v)} />
            </div>
            <div className="wizard-action">
                <IconButton onClick={props.previousStep} icon={<Icon icon="angle-left" />} appearance="primary" size="lg" circle />
                <Divider vertical />
                <IconButton disabled={!props.formData.category_id} onClick={props.nextStep} icon={<Icon icon="angle-right" />} appearance="primary" size="lg" circle />
            </div>
        </div>
    )
}
const Step3 = (props) => {
    return (
        <div className="wizard-step">
            <div className="wizard-question">
                Masukkan judul surat
            </div>
            <div className="wizard-form">
                <Input value={props.formData.title} placeholder="Judul surat" onChange={(v) => props.updateForm('title', v)} />
            </div>
            <div className="wizard-action">
                <IconButton onClick={props.previousStep} icon={<Icon icon="angle-left" />} appearance="primary" size="lg" circle />
                <Divider vertical />
                <IconButton disabled={!props.formData.title} onClick={props.nextStep} icon={<Icon icon="angle-right" />} appearance="primary" size="lg" circle />
            </div>
        </div>
    )
}
const Step4 = (props) => {
    return (
        <div className="wizard-step">
            <div className="wizard-question">
                Upload file surat
            </div>
            <div className="wizard-form">
                <input type="file" className="rs-input" accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        if (!file.type || "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document".indexOf(file.type) === -1) {
                            alert('File tidak didukung. Pilih dokumen word (.docx)');
                            e.target.value = null;
                            e.preventDefault();
                            return false;
                        }
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => {
                            props.updateForm('file', {
                                data: reader.result,
                                meta: file
                            });
                        }
                    }
                }} />
            </div>
            <div className="wizard-action">
                <IconButton onClick={props.previousStep} icon={<Icon icon="angle-left" />} appearance="primary" size="lg" circle />
                <Divider vertical />
                <IconButton disabled={!props.formData.file} onClick={props.nextStep} icon={<Icon icon="angle-right" />} appearance="primary" size="lg" circle />
            </div>
        </div>
    )
}
const Step5 = (props) => {
    return (
        <div>
            <h4>Tinjau pengisian</h4><br />
            <table className="review-table">
                <tbody>
                    <tr>
                        <td>Tipe Surat</td>
                        <td>{props.formData.type === 'Reguler' ? 'Surat Biasa' : 'Produk Hukum'}</td>
                    </tr>
                    <tr>
                        <td>Kategori Surat</td>
                        <td>{props.formData.category?.name}</td>
                    </tr>
                    <tr>
                        <td>Judul</td>
                        <td>{props.formData.title}</td>
                    </tr>
                    <tr>
                        <td>File</td>
                        <td>{props.formData.file?.meta.name}</td>
                    </tr>
                </tbody>
            </table>
            <Divider />
            <div className="wizard-form">
                <p style={{ fontSize: 20 }}>Apa anda yakin data diatas sudah benar?</p>
            </div>
            <div className="wizard-action">
                <IconButton onClick={props.previousStep} icon={<Icon icon="angle-left" />} appearance="primary" size="lg" circle />
                <Divider vertical />
                <IconButton loading={props.loading} onClick={async () => {
                    await props.onSubmit();
                    props.goToStep(1);
                }} icon={<Icon icon="check" />} appearance="primary" size="lg" circle />
            </div>
        </div>
    )
}