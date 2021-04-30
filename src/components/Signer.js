import React from 'react';
import { Loader, IconButton, Divider, Icon, Button } from 'rsuite';
import RegionSelect from 'react-region-select';

export default class Signer extends React.Component {
    state = {
        page: 0,
        letter: null,
        base64: null,
        region: { x: 0, y: 0, width: 0, height: 0, data: {} },
        loading: false
    }
    async componentDidMount() {
        const { letter, models } = this.props;
        const l = await models.Letter.single(letter.id);
        setTimeout(() => {
            this.setState({ letter: l }, this.fetchBase64.bind(this));
        }, 500);
    }
    async fetchBase64() {
        const { letter, page } = this.state;
        const { REACT_APP_API_HOST, REACT_APP_API_PORT } = process.env;
        const res = await fetch(`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/preview/${letter.id}/${page}`);
        const data = await res.json();
        this.setState({ base64: data.image });
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
    async onSign() {
        const { p12password } = this.props;
        const { letter, page, region } = this.state;
        this.setState({ loading: true });
        const x = (region.x / 100) * this.img.width;
        const y = (region.y / 100) * this.img.height;
        const w = (region.width / 100) * this.img.width;
        const h = (region.height / 100) * this.img.height;
        const res = await letter.$http(`letters/${letter.id}/sign`, 'POST', {
            body: {
                page: page,
                sigbox: [
                    x,
                    // flip y axis & minus that result to the height of the graphics to shift the graphics down
                    (this.img.height - y) - h,
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
        await this.fetchBase64();
        this.setState({ loading: false });
    }
    async onApprove() {
        const { letter } = this.state;
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
        this.setState({ loading: false });
        this.props.onSuccess && this.props.onSuccess();
    }
    render() {
        const { page, letter, base64, region, loading } = this.state;
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
                                regionStyle={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                                constraint={true}
                                maxRegions={1}
                                regions={[region]}
                                onChange={this.onRegionChange.bind(this)}>
                                <img ref={(img) => this.img = img} src={`data:image/png;base64,${base64}`} />
                            </RegionSelect>
                        ) : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>}
                    </div> : ''}
                    <Divider />
                    <Button color="blue" disabled={!base64} loading={loading} onClick={this.onSign.bind(this)} block>Tanda Tangani</Button>
                    <Button color="green" disabled={!base64} loading={loading} onClick={this.onApprove.bind(this)} block>Approve</Button>
                </div>
            ) : <div style={{ textAlign: 'center' }}><Loader size="md" /></div>
        )
    }
}