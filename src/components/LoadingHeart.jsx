import React from 'react';

const LoadingHeart = ({ message = "Loading" }) => {
    return (
        <div className="loading-container">
            <div className="heart-wrapper">
                <div className="pulsing-heart">💖</div>
            </div>
            <div className="loading-text">
                {message}<span className="dots"></span>
            </div>
        </div>
    );
};

export default LoadingHeart;
