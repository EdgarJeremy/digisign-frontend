import React from 'react';
import { Table, IconButton, Icon, Divider, InputGroup, Input, Modal, Button } from 'rsuite';
import AddFlow from '../../components/forms/AddFlow';
import EditFlow from '../../components/forms/EditFlow';

export default class Flow extends React.Component {
    state = {
        activePage: 1,
        displayLength: 10,
        keyword: '',
        roles: null,
        loading: true,
        showAddModal: false,
        showEditModal: false,
        showDeleteModal: false,
        selected: null,
        toDelete: null,
        deleteLoading: false
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
        const { models } = this.props;
        const roles = await models.Flow.collection({
            attributes: ['name'],
            offset: (activePage * displayLength) - displayLength,
            limit: displayLength,
            where: {
                name: {
                    $iLike: `%${keyword}%`
                }
            },
            order: [['name', 'asc']]
        });
        this.setState({ loading: false, roles: roles });
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
    render() {
        const { keyword, roles, loading, activePage, displayLength, showAddModal, showEditModal, showDeleteModal, toDelete, selected, deleteLoading } = this.state;
        return (
            <div className="contain" style={{ padding: 14 }}>
                <h3>Alur</h3>
                <div className="panel">
                    <div className="panel-toolbar">
                        <div className="panel-toolbar-left">
                            <IconButton onClick={() => this.setState({ showAddModal: true })} icon={<Icon icon="plus" />} placement="left">Tambah Alur</IconButton>
                        </div>
                        <div className="panel-toolbar-right">
                            <InputGroup>
                                <Input placeholder="cari..." value={keyword} onChange={this.onSearch.bind(this)} />
                                <InputGroup.Addon><Icon icon="search" /></InputGroup.Addon>
                            </InputGroup>
                        </div>
                    </div>
                    <Divider />
                    <Table
                        loading={loading}
                        autoHeight
                        data={!loading ? roles.rows : []}>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Nama</Table.HeaderCell>
                            <Table.Cell dataKey="name" />
                        </Table.Column>
                        <Table.Column flexGrow={1}>
                            <Table.HeaderCell>Opsi</Table.HeaderCell>
                            <Table.Cell>
                                {(row) => {
                                    return (
                                        <div>
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                this.onEdit(row);
                                            }}><Icon icon="edit" /> edit</a> | <a href="#" onClick={(e) => {
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
                        total={!loading ? roles.count : 0}
                        onChangePage={this.handleChangePage.bind(this)}
                        onChangeLength={this.handleChangeLength.bind(this)}
                    />
                </div>
                <Modal show={showAddModal} onHide={() => this.setState({ showAddModal: false })} size="xs">
                    <Modal.Header>
                        <Modal.Title>Alur Baru</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddFlow {...this.props} onSuccess={this.fetch.bind(this)} />
                    </Modal.Body>
                </Modal>

                <Modal show={showEditModal} onHide={() => this.setState({ showEditModal: false, selected })} size="xs">
                    <Modal.Header>
                        <Modal.Title>{selected && `Edit ${selected.name}`}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selected && <EditFlow {...this.props} role={selected} onSuccess={this.fetch.bind(this)} />}
                    </Modal.Body>
                </Modal>

                <Modal show={showDeleteModal} onHide={() => this.setState({ showDeleteModal: false, toDelete: null })} size="xs">
                    <Modal.Header>
                        <Modal.Title>{toDelete && `Hapus ${toDelete.name}`}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Apa anda yakin ingin menghapus {toDelete && toDelete.name}?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.onRealDelete.bind(this)} color="red">Ya</Button>
                        <Button loading={deleteLoading} onClick={() => this.setState({ showDeleteModal: false, toDelete: null })} appearance="subtle">Batal</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }

}