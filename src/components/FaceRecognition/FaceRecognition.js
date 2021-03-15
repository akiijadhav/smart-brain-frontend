import React from 'react'
import './FaceRecognitionBox.css';

const FaceRecognition = ({imageUrl, boxes}) => {
    return (
        <div className="center ma">
            <div className="absolute mt2">
                <img id='inputImage'
                     src={imageUrl}
                     alt=""
                     width='500px'
                     height='auto'/>
                {
                    boxes.map(box => {
                        return <div className="bounding-box"
                                    key={box.topRow}
                                    style={{
                                        top: box.topRow,
                                        right: box.rightCol,
                                        bottom: box.bottomRow,
                                        left: box.leftCol
                                    }}/>
                    })
                }
            </div>
        </div>
    )
}

export default FaceRecognition;