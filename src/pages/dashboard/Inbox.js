import React from 'react';
import { Table, Icon, Divider, InputGroup, Input, Modal, Alert, Button } from 'rsuite';
import Viewer from '../../components/Viewer';

const structure = ['SKPD', 'Bagian Umum', 'Bagian Hukum', 'Sekretaris Daerah', 'Wakil Bupati', 'Bupati'];

export default class Inbox extends React.Component {
    state = {
        activePage: 1,
        displayLength: 10,
        keyword: '',
        letters: null,
        loading: true,
        revisionFiles: {},
        toApprove: null,
        toPreview: null,
        passwordModal: false,
        p12password: ''
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
            attributes: ['title', 'position_id', 'signatures_pos'],
            include: [{
                model: 'Category',
                attributes: ['id', 'name']
            }, {
                model: 'Division',
                attributes: ['id', 'name']
            }, {
                model: 'User',
                attributes: ['id', 'name']
            }],
            offset: (activePage * displayLength) - displayLength,
            limit: displayLength,
            where: {
                title: {
                    $iLike: `%${keyword}%`
                },
                position_id: user.role_id,
                user_id: {
                    $ne: user.id
                },
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
        if (!item.last) {
            const confirmed = window.confirm(`Anda yakin akan mengapprove?`);
            if (confirmed) {
                await item.update({ position_id: 'next', file: revisionFiles[`file-${item.id}`] });
                await models.Log.create({
                    type: 'APPROVAL',
                    note: '',
                    user_id: user.id,
                    letter_id: item.id
                });
                await this.fetch();
            }
        } else {
            this.setState({ toApprove: item, passwordModal: true });
        }
    }
    async onReject(item) {
        const { user, models } = this.props;
        const reason = window.prompt(`Masukkan alasan penolakan`);
        if (reason !== null) {
            await item.update({ position_id: 'reject' });
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
    async onSign(letter, signature) {
        const { region, page, img } = signature;
        const { p12password } = this.state;
        this.setState({ loading: true });
        const x = (region.x / 100) * img.width;
        const y = (region.y / 100) * img.height;
        const w = (region.width / 100) * img.width;
        const h = (region.height / 100) * img.height;
        const res = await letter.$http(`letters/${letter.id}/sign`, 'POST', {
            body: {
                page: page,
                sigbox: [
                    x,
                    // flip y axis & minus that result to the height of the graphics to shift the graphics down
                    (img.height - y) - h,
                    w,
                    h
                ],
                p12password
            }
        });
        if (res.headers['x-access-token'] && res.headers['x-refresh-token']) {
            localStorage.setItem('app_accessToken', res.headers['x-access-token']);
            localStorage.setItem('app_refreshToken', res.headers['x-refresh-token']);
        }
    }
    async onDone(letter) {
        Alert.info('Menandatangani surat...', 0);
        for (let i = 0; i < letter.signatures_pos.length; i++) {
            await this.onSign(letter, letter.signatures_pos[i]);
        }
        Alert.closeAll();
        Alert.info('Mengapprove surat..');
        const { models, user } = this.props;
        this.setState({ loading: true });
        const res = await letter.$http(`letters/${letter.id}/approve`, 'POST', {
            body: {
            }
        });
        if (res.headers['x-access-token'] && res.headers['x-refresh-token']) {
            localStorage.setItem('app_accessToken', res.headers['x-access-token']);
            localStorage.setItem('app_refreshToken', res.headers['x-refresh-token']);
        }
        await models.Log.create({
            type: 'APPROVAL',
            note: '',
            user_id: user.id,
            letter_id: letter.id
        });
        Alert.success('Surat berhasil ditandatangani dan diapprove..');
        this.fetch();
    }
    onOpenPreview(row) {
        this.setState({ toPreview: row });
    }
    render() {
        const { keyword, letters, loading, activePage, displayLength, toApprove, toPreview, passwordModal } = this.state;
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
                            <Table.Cell>
                                {(row) => (
                                    <a href="#" onClick={(e) => {
                                        e.preventDefault();
                                        this.onOpenPreview(row);
                                    }}>{row.title}</a>
                                )}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Pemohon</Table.HeaderCell>
                            <Table.Cell dataKey="user.name" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Dinas</Table.HeaderCell>
                            <Table.Cell dataKey="division.name" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Kategori</Table.HeaderCell>
                            <Table.Cell dataKey="category.name" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>File Dokumen</Table.HeaderCell>
                            <Table.Cell>
                                {
                                    (row) => (
                                        <a target="_blank" href={`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/document/${row.id}`}><Icon icon="download" /> download</a>
                                    )
                                }
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

                {/* <Modal show={!!toApprove && !!p12password} onHide={() => this.setState({ toApprove: null, p12password: '' })} size="lg">
                    <Modal.Header>
                        <Modal.Title>Approve dan Tanda tangani</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: 'auto' }}>
                        {toApprove && <Signer models={this.props.models} p12password={p12password} letter={toApprove} user={this.props.user} onSuccess={() => {
                            Alert.success('Surat berhasil diapprove dan ditandatangani');
                            this.setState({ toApprove: null }, this.fetch.bind(this));
                        }} />}
                    </Modal.Body>
                </Modal> */}

                <Modal show={!!passwordModal} onHide={() => this.setState({ passwordModal: null })} size="xs">
                    <Modal.Header>
                        <Modal.Title>Masukkan password tanda tangan elektronik</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: 'auto' }}>
                        <Input type="password" inputRef={(e) => this._iP12 = e} placeholder="password" />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.setState({ p12password: this._iP12.value, passwordModal: false }, () => this.onDone(toApprove))}>Konfirmasi</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={!!toPreview} onHide={() => this.setState({ toPreview: null })} size="lg">
                    <Modal.Header>
                        <Modal.Title>{toPreview && toPreview.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: 'none' }}>
                        <div style={{ width: '100%' }}>
                            {toPreview && <Viewer final={!!toPreview.number} id={toPreview.id} />}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.setState({ toPreview: null })} appearance="subtle">Tutup</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }

}