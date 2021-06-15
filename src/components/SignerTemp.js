import React from 'react';
import { Loader, IconButton, Divider, Icon, Button } from 'rsuite';
import RegionSelect from 'react-region-select';

export default class SignerTemp extends React.Component {
    state = {
        page: 0,
        letter: null,
        base64: null,
        region: { x: 0, y: 0, width: 0, height: 0, data: {} },
        loading: false,
        signatures: [],
        img: null
    }
    async componentDidMount() {
        const { id, models } = this.props;
        const { REACT_APP_API_HOST, REACT_APP_API_PORT } = process.env;
        fetch(`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/info_temp/${id}`).then((res) => res.json()).then((res) => {
            this.setState({ letter: { page_count: res.data } }, this.fetchBase64.bind(this));
        });
    }
    async fetchBase64() {
        const { page } = this.state;
        const { id } = this.props;
        const { REACT_APP_API_HOST, REACT_APP_API_PORT } = process.env;
        const res = await fetch(`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/preview_temp/${id}/${page}`);
        const data = await res.json();
        const img = new Image();
        img.src = `data:image/png;base64,${data.image}`;
        img.onload = () => {
            this.setState({ base64: data.image, img });
        }
    }
    onNextPage() {
        const { letter, page } = this.state;
        if (page + 2 <= letter.page_count) {
            this.setState({ base64: null, page: page + 1 }, this.fetchBase64.bind(this));
        }
    }
    onPreviousPage() {
        const { page } = this.state;
        if ((page + 1) - 1 >= 0) {
            this.setState({ base64: null, page: page - 1 }, this.fetchBase64.bind(this));
        }
    }
    onChangePage(e) {
        const { letter } = this.state;
        const page = parseInt(e.target.value, 10);
        if (page > letter.page_count || page < 0) return;
        this.setState({ base64: null, page: page - 1 }, this.fetchBase64.bind(this));
    }
    onRegionChange(regions) {
        this.setState({ region: regions[0] });
    }
    onMark() {
        const { signatures, region, page, img } = this.state;
        signatures.push({ page, region, img: { width: img.width, height: img.height } });
        this.setState({ signatures });
    }
    onDone() {
        this.props.onDone && this.props.onDone(this.state.signatures);
    }
    render() {
        const { page, letter, base64, region, loading, signatures, img } = this.state;
        return (
            letter ? (
                <div>
                    <div className="preview-action">
                        <p>Halaman <input type="number" value={page + 1} onChange={this.onChangePage.bind(this)} /> dari {letter.page_count}</p><br />
                        <IconButton disabled={page === 0} loading={!base64} onClick={this.onPreviousPage.bind(this)} icon={<Icon icon="angle-left" />} appearance="primary" size="lg" circle />
                        <Divider vertical />
                        <IconButton disabled={page + 1 === letter.page_count} loading={!base64} onClick={this.onNextPage.bind(this)} icon={<Icon icon="angle-right" />} appearance="primary" size="lg" circle />
                    </div>
                    <Divider />
                    {typeof page === 'number' && !isNaN(page) ? <div className="preview-content">
                        {base64 ? (
                            <RegionSelect
                                regionStyle={{ backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 9 }}
                                constraint={true}
                                maxRegions={1}
                                regions={[region]}
                                onChange={this.onRegionChange.bind(this)}>
                                <div style={{ position: 'relative' }}>
                                    <img src={`data:image/png;base64,${base64}`} />
                                    {signatures.filter((s) => s.page === page).map((s, i) => {
                                        const x = (s.region.x / 100) * img.width;
                                        const y = (s.region.y / 100) * img.height;
                                        const w = (s.region.width / 100) * img.width;
                                        const h = (s.region.height / 100) * img.height;
                                        return <div key={i} style={{ position: 'absolute', top: y, left: x, width: w, height: h, backgroundColor: 'rgba(0,0,0,.7)' }}></div>
                                    })}
                                </div>
                            </RegionSelect>
                        ) : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>}
                    </div> : ''}
                    <Divider />
                    <Button color="green" disabled={!base64} loading={loading} onClick={this.onMark.bind(this)} block>Tandai</Button>
                    <Button color="green" disabled={!base64} loading={loading} onClick={this.onDone.bind(this)} block>Kirim</Button>
                </div>
            ) : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>
        )
    }
}