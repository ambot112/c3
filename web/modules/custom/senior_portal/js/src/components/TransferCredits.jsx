import React, { useEffect, useState } from 'react';

export function TransferCredits({ state, setState }) {
  const maxCredits = state.programCost.maxCreditTransfer;
  const costPerCredit = state.programCost.costPerCredit;

  const [transferCredits, setTransferCredits] = useState(() => (
    state.transferCredits || (maxCredits <= 12 ? maxCredits : 12)
  ));

  // Handle slider input.
  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setTransferCredits(value);
  };

  // Handle text input with leading zero fix.
  const handleInputChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value.replace(/^0+(?!$)/, '')) || 0, 0), maxCredits);
    setTransferCredits(value);
  };

  // Sync with parent state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      transferCredits: transferCredits
    }));
  }, [transferCredits, setState]);

  const potentialSavings = transferCredits * costPerCredit;

  return (
    <div className="transfer-credits">
      <h3>Transfer Credits from Experience</h3>

      <div>
        <p>
          Sources of credit include: community college or other university credits, military training or service, work experience or test out of classes.
        </p>

        <label htmlFor="transfer-credits-input" aria-live="polite">
          <h4>${potentialSavings.toLocaleString()}</h4>
          <span>Savings</span>
        </label>

        <input
          type="range"
          id="transfer-credits-slider"
          min={0}
          max={maxCredits}
          step={1}
          value={transferCredits}
          onChange={handleSliderChange}
          aria-label="Transfer Credits slider"
        />

        <div className="tw-flex transfer-credits__text">
          <div className="transfer-credits__text__box">
            <b>Credits</b>
            <input
              type="text"  // Changed to text to fix leading zero issue
              aria-label="Transfer Credits"
              id="transfer-credits-input"
              min={0}
              max={maxCredits}
              value={transferCredits}
              onChange={handleInputChange}
              pattern="\d{1,2}"  // Allow only digits
            />
          </div>
          <p>
            At a rate of ${costPerCredit.toLocaleString()} per credit. We look at cost-per credit and multiply by the number of credits being transferred. Course costs may vary.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TransferCredits;
