import React from 'react';

export default class Viewer extends React.Component {
    render() {
        const { REACT_APP_API_HOST, REACT_APP_API_PORT } = process.env;
        return (
            <div style={{ width: '100%', height: '700px' }}>
                <embed src={`${REACT_APP_API_HOST}:${REACT_APP_API_PORT}/d/${this.props.id}`} type="application/pdf" width="100%" height="700px" />
            </div>
        )
    }
}