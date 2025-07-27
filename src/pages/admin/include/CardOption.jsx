import React from 'react';

function CardOption({ title, themeColor, selected, onClick }) {
  return (
    <div className="col-md-4 col-sm-6 mb-3">
      <div
        className={`card p-3 text-center cursor-pointer h-100 d-flex flex-column justify-content-between align-items-center ${
          selected ? 'border-primary border-3' : 'border'
        } rounded-4 shadow-sm`}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex flex-column align-items-center w-100">
          <div
            className="w-100 rounded-top-3"
            style={{
              height: '50px',
              backgroundColor: themeColor,
              borderBottom: `1px solid ${selected ? themeColor : '#ddd'}`
            }}
          ></div>
          <div
            className="w-100 bg-light rounded-bottom-3"
            style={{
              height: '50px',
              borderTop: `1px solid ${selected ? themeColor : '#ddd'}`
            }}
          ></div>
        </div>
        <h6 className="mt-3 mb-1 fw-semibold">{title}</h6>
        {selected && (
          <i
            className="bi bi-check-circle-fill text-primary position-absolute"
            style={{ top: '10px', right: '10px', fontSize: '1.5rem' }}
          ></i>
        )}
      </div>
    </div>
  );
}

export default CardOption;
