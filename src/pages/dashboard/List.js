import React from 'react';
import { Table, IconButton, Icon, Divider, InputGroup, Input, Modal, Button } from 'rsuite';
import Detail from '../../components/Detail';
import Viewer from '../../components/Viewer';

export default class List extends React.Component {
    state = {
        activePage: 1,
        displayLength: 10,
        keyword: '',
        letters: null,
        loading: true,
        toDelete: null,
        deleteLoading: false,
        selected: null,
        toPreview: null
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
            attributes: ['title', 'number', 'position_id', 'updated_at'],
            include: [{
                model: 'Category',
                attributes: ['id', 'name']
            }, {
                model: 'Log',
                attributes: ['id', 'type']
            }, {
                model: 'Role',
                as: 'Position',
                attributes: ['id', 'name']
            }],
            offset: (activePage * displayLength) - displayLength,
            limit: displayLength,
            where: {
                title: {
                    $iLike: `%${keyword}%`,
                },
                division_id: user.division_id
            },
            order: [['updated_at', 'desc']]
        });
        this.setState({ loading: false, letters: letters });
    }
    onSearch(keyword) {
        this.setState({ keyword }, this.fetch.bind(this));
    }
    onEdit(item) {
        this.setState({ selected: item, showEditModal: true });
    }
    onDelete(item) {
        this.setState({ toDelete: item, showDeleteModal: true });
    }
    async onRealDelete() {
        const { toDelete } = this.state;
        this.setState({ deleteLoading: true });
        await toDelete.delete();
        this.setState({ deleteLoading: false, showDeleteModal: false, toDelete: null }, this.fetch.bind(this));
    }
    onDetail(item) {
        this.setState({ selected: item });
    }
    onOpenFinal(row) {
        this.setState({ toPreview: row });
    }
    render() {
        const { keyword, letters, loading, activePage, displayLength, showDeleteModal, toDelete, deleteLoading, selected, toPreview } = this.state;
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
                        <Table.Column>
                            <Table.HeaderCell>Dokumen</Table.HeaderCell>
                            <Table.Cell>
                                {
                                    (row) => (
                                        row.number ? (
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                this.onOpenFinal(row);
                                            }}>{row.title}.pdf</a>
                                        ) : (
                                            <a target="_blank" href={`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/document/${row.id}`}>{row.title}.docx</a>
                                        )
                                    )
                                }
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Posisi Dokumen</Table.HeaderCell>
                            <Table.Cell dataKey="Position.name" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => (
                                    row.number ? (
                                        <span style={{ color: '#2ecc71' }}><Icon icon="check" /> selesai</span>
                                    ) : (<span style={{ color: '#e74c3c' }}><Icon icon="circle" /> dalam proses</span>)
                                )}
                            </Table.Cell>
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Perkembangan</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => {
                                    return (
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            this.onDetail(row);
                                        }} style={{ textDecoration: 'none' }}>
                                            <span style={{ color: '#2ecc71' }}><Icon icon="long-arrow-up" /> {row.logs.filter((l) => l.type === 'APPROVAL').length}</span>{' '}
                                            <span style={{ color: '#e74c3c' }}><Icon icon="long-arrow-down" /> {row.logs.filter((l) => l.type === 'REJECTION').length}</span>
                                        </a>
                                    )
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
                                                this.onDetail(row);
                                            }}><Icon icon="info" /> detail</a> | {' '}
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                this.onDelete(row);
                                            }}><Icon icon="trash-o" /> hapus</a>
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

                <Modal show={showDeleteModal} onHide={() => this.setState({ showDeleteModal: false, toDelete: null })} size="xs">
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
                </Modal>

                <Modal show={!!selected} onHide={() => this.setState({ selected: null })} size="lg">
                    <Modal.Header>
                        <Modal.Title>Detail Surat</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selected && <Detail letter={selected} models={this.props.models} />}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => this.setState({ selected: null })} appearance="subtle">Tutup</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={!!toPreview} onHide={() => this.setState({ toPreview: null })} size="lg">
                    <Modal.Header>
                        <Modal.Title>{toPreview && toPreview.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: 'none' }}>
                        <div style={{ width: '100%' }}>
                            {toPreview && <Viewer id={toPreview.id} />}
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