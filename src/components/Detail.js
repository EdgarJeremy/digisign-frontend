import React from 'react';
import moment from 'moment';
import { Divider, Loader, Tag } from 'rsuite';
import 'moment/locale/id';

export default class Detail extends React.Component {
    state = {
        letter: null
    }
    async componentDidMount() {
        const { letter, models } = this.props;
        const l = await models.Letter.single(letter.id);
        setTimeout(() => {
            this.setState({ letter: l });
        }, 500);
    }
    render() {
        const { letter } = this.state;
        const { REACT_APP_API_HOST, REACT_APP_API_PORT } = process.env;
        return (
            letter ? <div>
                <h6>Info</h6><br />
                <table className="main-info">
                    <tbody>
                        <tr>
                            <td>Judul</td>
                            <td>{letter.title}</td>
                        </tr>
                        <tr>
                            <td>Kategori</td>
                            <td>{letter.category.name}</td>
                        </tr>
                        <tr>
                            <td>File Dokumen</td>
                            <td><a target="_blank" href={`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/document/${letter.id}`}>{letter.title}.docx</a></td>
                        </tr>
                        <tr>
                            <td>Posisi Dokumen</td>
                            <td>{letter.position}</td>
                        </tr>
                    </tbody>
                </table>
                <Divider />
                <h6>Rekam Jejak</h6><br />
                <table className="main-info">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Aksi</th>
                            <th>Oleh</th>
                            <th>Pada</th>
                            <th>Catatan</th>
                            <th>File Revisi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {letter.logs.map((l, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td><Tag color={l.type === 'APPROVAL' ? 'green' : (l.type === 'REVISION' ? 'orange' : 'red')}>{l.type}</Tag></td>
                                <td>{l.user.name}</td>
                                <td>{moment(l.created_at).format('MMMM Do YYYY, h:mm:ss a')}</td>
                                <td>{l.note ? l.note : '-'}</td>
                                <td>{l.type === 'REVISION' ? <a target="_blank" href={`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/log/${letter.id}/${l.id}`}>{letter.title}.docx</a> : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>
        )
    }
}