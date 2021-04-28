import React from 'react';
import { Table, Icon, Divider, InputGroup, Input, Modal, Alert } from 'rsuite';
import Signer from '../../components/Signer';

const structure = ['SKPD', 'Bagian Umum', 'Bagian Hukum', 'Sekretaris Daerah', 'Wakil Bupati', 'Bupati'];

export default class Inbox extends React.Component {
    state = {
        activePage: 1,
        displayLength: 10,
        keyword: '',
        letters: null,
        loading: true,
        revisionFiles: {},
        toApprove: null
    }
    async componentDidMount() {
        await this.fetch();
    }
    handleChangePage(activePage) {
        this.setState({ activePage }, async () => await this.fetch());
    }
    handleChangeLength(displayLength) {
        this.setState({ displayLength }, async () => await this.fetch());
    }
    async fetch() {
        this.setState({ loading: true });
        const { activePage, displayLength, keyword } = this.state;
        const { models, user } = this.props;
        const letters = await models.Letter.collection({
            attributes: ['title', 'type', 'position'],
            include: [{
                model: 'Category',
                attributes: ['id', 'name']
            }, {
                model: 'Division',
                attributes: ['id', 'name', 'asst']
            }],
            offset: (activePage * displayLength) - displayLength,
            limit: displayLength,
            where: {
                title: {
                    $iLike: `%${keyword}%`
                },
                position: user.type,
                number: null
            },
            order: [['created_at', 'desc']]
        });
        this.setState({ loading: false, letters: letters });
    }
    onSearch(keyword) {
        this.setState({ keyword }, this.fetch.bind(this));
    }
    onEdit(item) {
        this.setState({ selected: item, showEditModal: true });
    }
    async onApprove(item) {
        const { user, models } = this.props;
        const { revisionFiles } = this.state;
        let nextPos;
        if (item.position === 'Bagian Umum' || item.position === 'Bagian Hukum') {
            nextPos = item.division.asst;
        } else if (['Asisten 1', 'Asisten 2', 'Asisten 3'].indexOf(item.position) !== -1) {
            nextPos = 'Sekretaris Daerah';
        } else {
            nextPos = structure[structure.indexOf(item.position) + 1];
        }
        if (nextPos) {
            const confirmed = window.confirm(`Anda yakin akan mengapprove?`);
            if (confirmed) {
                await item.update({ position: nextPos, file: revisionFiles[`file-${item.id}`] });
                await models.Log.create({
                    type: 'APPROVAL',
                    note: '',
                    user_id: user.id,
                    letter_id: item.id
                });
                await this.fetch();
            }
        } else {
            this.setState({ toApprove: item });
        }
    }
    async onReject(item) {
        const { user, models } = this.props;
        const reason = window.prompt(`Masukkan alasan penolakan`);
        if (reason !== null) {
            await item.update({ position: 'SKPD' });
            await models.Log.create({
                type: 'REJECTION',
                note: reason,
                user_id: user.id,
                letter_id: item.id
            });
            await this.fetch();
        }
    }
    async onRevise(e, item) {
        const file = e.target.files[0];
        const { revisionFiles } = this.state;
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
                revisionFiles[`file-${item.id}`] = reader.result;
                this.setState({ revisionFiles });
            }
        }
    }
    render() {
        const { keyword, letters, loading, activePage, displayLength, toApprove } = this.state;
        const { user } = this.props;
        const { REACT_APP_API_HOST, REACT_APP_API_PORT } = process.env;
        return (
            <div className="contain" style={{ padding: 14 }}>
                <h3>Daftar Surat</h3>
                <div className="panel">
                    <div className="panel-toolbar">
                        {/* <div className="panel-toolbar-right"> */}
                        <InputGroup>
                            <Input placeholder="cari..." value={keyword} onChange={this.onSearch.bind(this)} />
                            <InputGroup.Addon><Icon icon="search" /></InputGroup.Addon>
                        </InputGroup>
                        {/* </div> */}
                    </div>
                    <Divider />
                    <Table
                        loading={loading}
                        wordWrap
                        autoHeight
                        data={!loading ? letters.rows : []}>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Judul</Table.HeaderCell>
                            <Table.Cell dataKey="title" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Pemohon</Table.HeaderCell>
                            <Table.Cell dataKey="division.name" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Tipe</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => {
                                    return row.type === 'Reguler' ? 'Surat Biasa' : 'Produk Hukum';
                                }}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Kategori</Table.HeaderCell>
                            <Table.Cell dataKey="category.name" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>File Dokumen</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => <a target="_blank" href={`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/document/${row.id}`}>{row.title}.docx</a>}
                            </Table.Cell>
                        </Table.Column>
                        {user.type === 'Bupati' || user.type === 'Wakil Bupati' ? '' : <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Upload File Revisi</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => {
                                    return <input accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" type="file" onChange={(e) => this.onRevise(e, row)} />;
                                }}
                            </Table.Cell>
                        </Table.Column>}
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Opsi</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => {
                                    return (
                                        <div>
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                this.onApprove(row);
                                            }}><Icon icon="check" /> setujui</a> | <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                this.onReject(row);
                                            }} style={{ color: '#c0392b' }}><Icon icon="close" /> tolak</a>
                                        </div>
                                    )
                                }}
                            </Table.Cell>
                        </Table.Column>
                    </Table>
                    <Table.Pagination
                        lengthMenu={[{
                            value: 10,
                            label: 10
                        }, {
                            value: 20,
                            label: 20
                        }, {
                            value: 30,
                            label: 30
                        }]}
                        activePage={activePage}
                        displayLength={displayLength}
                        total={!loading ? letters.count : 0}
                        onChangePage={this.handleChangePage.bind(this)}
                        onChangeLength={this.handleChangeLength.bind(this)}
                    />
                </div>

                <Modal show={!!toApprove} onHide={() => this.setState({ toApprove: null })} size="lg">
                    <Modal.Header>
                        <Modal.Title>Approve dan Tanda tangani</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: 'auto' }}>
                        {toApprove && <Signer models={this.props.models} letter={toApprove} user={this.props.user} onSuccess={() => {
                            Alert.success('Surat berhasil diapprove dan ditandatangani');
                            this.setState({ toApprove: null }, this.fetch.bind(this));
                        }} />}
                    </Modal.Body>
                </Modal>
            </div>
        )
    }

}