import React from "react";
import "./imageLinkForm.css";

const ImageLinkForm = ({ onInputChange, onButtonSubmit }) => {
    return(
        <div>
            <p className="f3">
                {'Please upload a picture with faces.'}
            </p>
            <div className="center">
                <div className="center form pa3 br3 shadow-5">
                    <input className="f4 pa2 w-70 center" type="text" onChange={onInputChange} />
                    <button 
                        className="w-30 grow f4 link ph3 pv2 dib black bg-light-blue"
                        onClick={onButtonSubmit}
                    >
                        {'Detect'}
                    </button>
                </div>
            </div>

        </div>
    )
}
export default ImageLinkForm;