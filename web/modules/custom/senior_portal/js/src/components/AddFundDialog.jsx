import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';
import Select from 'react-select';

function AddFundDialog({ isOpen, onClose }) {
  useEffect(() => {
    Modal.setAppElement(document.body); // Fix modal accessibility issue
  }, []);

  const [formData, setFormData] = useState({
    aidType: null,
    frequency: null,
    amount: '',
    total: 0,
  });

  // Reset form data when the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        aidType: null,
        frequency: null,
        amount: '',
        total: 0,
      });
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = useCallback(() => {
    onClose(formData); // Send form data to parent and close modal
  }, [formData, onClose]);

  const handleCancel = () => {
    onClose(null); // Close modal without submitting data
  };

  const isFormValid = formData.aidType && formData.frequency && formData.amount && parseFloat(formData.amount) > 0;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCancel} // Allow closing when clicking outside
      style={{
        content: {
          width: '100%',
          maxWidth: '361px',
          backgroundColor: 'transparent',
          border: 'none',
          margin: 'auto',
          position: 'absolute',
          padding: '0px',
          inset: '0px',
          height: '100%',
          maxHeight: '445px',
          overflow: 'initial',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          zIndex: 1000,
          overflow: 'auto',
        },
      }}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className="cost-calculator-dialog-wrapper">
        {/* Close button */}
        <div className='close'>
          <button onClick={handleCancel} aria-label="Close 'Add Fund' modal">
            <X size={24} />
          </button>
        </div>
        <h2>Add Fund</h2>
        <div>
          {/* Aid Type Selection */}
          <div className="cost-calculator-select">
            <label htmlFor='dialog-type-of-aid' id='dialog-type-of-aid-label' className='required'>Type of Aid</label>
            <Select
              instanceId="aid-type-select"
              placeholder="Select"
              aria-labelledby="dialog-type-of-aid-label"
              value={formData.aidType}
              onChange={(value) => handleInputChange('aidType', value)}
              options={[
                { value: 'benefit', label: 'Benefit' },
                { value: 'grant', label: 'Grant' },
                { value: 'scholarship', label: 'Scholarship' },
              ]}
              id="dialog-type-of-aid"
              required
              styles={{ control: (base) => ({ ...base }) }}
            />
          </div>

          {/* Frequency Selection */}
          <div className="cost-calculator-select">
            <label htmlFor='dialog-frequency-of-aid' id='dialog-frequency-of-aid-label' className='required'>Frequency of Aid</label>
            <Select
              instanceId="frequency-select"
              placeholder="Select"
              aria-labelledby="dialog-frequency-of-aid-label"
              value={formData.frequency}
              onChange={(value) => handleInputChange('frequency', value)}
              options={[
                { value: 'once', label: 'Once' },
                { value: 'per_session', label: 'Per Session' },
                { value: 'yearly', label: 'Per Year' },
              ]}
              id="dialog-frequency-of-aid"
              required
              styles={{ control: (base) => ({ ...base }) }}
            />
          </div>

          {/* Amount Input */}
          <div className="cost-calculator-select">
            <label htmlFor='dialog-amount-of-aid' id='dialog-amount-of-aid-label' className='required'>Amount of Aid</label>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
              <span style={{ position: 'relative' }}>$</span>
              <input
                type="number"
                aria-labelledby="dialog-amount-of-aid-label"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '10px',
                }}
                id="dialog-amount-of-aid"
                placeholder="Enter amount"
                required
                min="0"
                max="100000"
                step="1"
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="dialog-submit" onClick={handleSubmit} disabled={!isFormValid} style={{ width: '45%', height: '48px', border: '1px solid #777', cursor: 'pointer', opacity: isFormValid ? 1 : 0.5 }}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default AddFundDialog;
