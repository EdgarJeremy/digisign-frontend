import React from 'react';

export default class Viewer extends React.Component {
    render() {
        const { REACT_APP_API_HOST, REACT_APP_API_PORT } = process.env;
        const { final = true } = this.props;
        return (
            <div style={{ width: '100%', height: '700px' }}>
                <embed src={`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/${final ? 'd' : 'pdf'}/${this.props.id}`} type="application/pdf" width="100%" height="700px" />
            </div>
        )
    }
}