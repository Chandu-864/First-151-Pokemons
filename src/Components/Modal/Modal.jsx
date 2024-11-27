import React from 'react'
import '../Modal/Modal.css'
import ReactDom from 'react-dom'

function Modal (props) {
    const {children, handleCloseModal} = props
    return (
        ReactDom.createPortal(
            <div className='modal-container'>
                <button className='modal-underlay' onClick={handleCloseModal}></button>
                <div className='modal-content'>
                    {children}
                </div>
            </div>,
            document.getElementById('portal')
        )
    )

}

export default Modal