import React from 'react';
import { Table, Icon, Divider, InputGroup, Input, Alert } from 'rsuite';

const structure = ['SKPD', 'Bagian Umum', 'Bagian Hukum', 'Sekretaris Daerah', 'Wakil Bupati', 'Bupati'];

export default class Rejected extends React.Component {
    state = {
        activePage: 1,
        displayLength: 10,
        keyword: '',
        letters: null,
        loading: true,
        toDelete: null,
        deleteLoading: false,
        revisionFiles: {}
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
            attributes: ['title', 'position_id'],
            include: [{
                model: 'Category',
                attributes: ['id', 'name']
            }, {
                model: 'Division',
                attributes: ['id', 'name']
            }, {
                model: 'Log',
                attributes: ['id', 'note'],
                include: [{
                    model: 'User',
                    attributes: ['id', 'name']
                }]
            }, {
                model: 'Role',
                as: 'Position',
                attributes: ['id', 'name']
            }],
            offset: (activePage * displayLength) - displayLength,
            limit: displayLength,
            where: {
                title: {
                    $iLike: `%${keyword}%`
                },
                position_id: user.role_id,
                division_id: user.division_id,
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
        const confirmed = window.confirm(`Anda yakin akan mengirim lagi?`);
        let nextPos;
        if (confirmed) {
            if (item.position === 'Bagian Umum' || item.position === 'Bagian Hukum') {
                nextPos = item.division.asst;
            } else if (item.position === 'SKPD') {
                nextPos = item.type === 'Reguler' ? 'Bagian Umum' : 'Bagian Hukum';
            } else {
                nextPos = structure[structure.indexOf(item.position) + 1];
            }
            if (nextPos) {
                await item.update({ position: nextPos, file: revisionFiles[`file-${item.id}`] });
                await models.Log.create({
                    type: 'APPROVAL',
                    note: '',
                    user_id: user.id,
                    letter_id: item.id
                });
            } else {
                // todo : done
            }
            await this.fetch();
        }
    }
    async onRevise(e, item) {
        const file = e.target.files[0];
        const { revisionFiles } = this.state;
        if (file) {
            console.log(file, item);
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
        const { keyword, letters, loading, activePage, displayLength, showDeleteModal, toDelete, deleteLoading } = this.state;
        const { REACT_APP_API_HOST, REACT_APP_API_PORT } = process.env;
        return (
            <div className="contain" style={{ padding: 14 }}>
                <h3>Surat Ditolak</h3>
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
                        autoHeight
                        data={!loading ? letters.rows : []}>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Judul</Table.HeaderCell>
                            <Table.Cell dataKey="title" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Kategori</Table.HeaderCell>
                            <Table.Cell dataKey="category.name" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Ditolak Oleh</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => (
                                    `${row.logs[row.logs.length - 1].user.name}`
                                )}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Alasan Penolakan</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => (
                                    `${row.logs[row.logs.length - 1].note}`
                                )}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>File Dokumen</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => <a target="_blank" href={`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/document/${row.id}`}>{row.title}.docx</a>}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Upload File Revisi</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => {
                                    return <input accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" type="file" onChange={(e) => this.onRevise(e, row)} />;
                                }}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Opsi</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => {
                                    return (
                                        <div>
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                this.onApprove(row);
                                            }}><Icon icon="send-o" /> kirim lagi</a>
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

                {/* <Modal show={showDeleteModal} onHide={() => this.setState({ showDeleteModal: false, toDelete: null })} size="xs">
                    <Modal.Header>
                        <Modal.Title>{toDelete && `Hapus ${toDelete.title}`}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Apa anda yakin ingin menghapus {toDelete && toDelete.title}?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.onRealDelete.bind(this)} color="red">Ya</Button>
                        <Button loading={deleteLoading} onClick={() => this.setState({ showDeleteModal: false, toDelete: null })} appearance="subtle">Batal</Button>
                    </Modal.Footer>
                </Modal> */}
            </div>
        )
    }

}