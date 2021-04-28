import React from 'react';
import { Loader } from 'rsuite';

export default class Loading extends React.Component {
    render() {
        return (
            <div className="etup-loading">
                <div className="loading-img">
                    <div className="loading-fill"></div>
                    <img src={require('../images/e-tup.png')} />
                </div>
                <Loader size="md" content="Menghubungi server..."/>
            </div>
        )
    }
}