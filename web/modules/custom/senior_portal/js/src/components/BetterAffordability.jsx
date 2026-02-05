import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import AddFundDialog from './AddFundDialog';

export function BetterAffordability({ state, setState, blockConfigs }) {
  const sge = blockConfigs.sge;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Cache DOM selectors for performance.
  const getCustomButton = () => document.querySelector('#cost-calculator-app .left-content .add-amount-button');
  const getRemoveButtons = () => document.querySelectorAll('#cost-calculator-app .created-items-list .remove-button');
  const getPagerSpans = () => document.querySelectorAll('#cost-calculator-app .left-content .pager > span');

  // Calculate totalAid whenever aidItems change
  useEffect(() => {
    const newTotalAid = state.aidItems.reduce((sum, item) => sum + Number(item.total), 0);
    setState(prevState => ({
      ...prevState,
      totalAid: newTotalAid,
    }));
  }, [state.aidItems, setState]);

  // Clear selected index if aidItems is empty.
  useEffect(() => {
    if (state.aidItems.length === 0) {
      setState(prevState => ({
        ...prevState,
        selectedAidIndex: null,
      }));
    }
  }, [state.aidItems, setState]);

  // Manage button focus.
  const handleButtonFocus = (index) => {
    setTimeout(() => {
      const removeButtons = getRemoveButtons();

      if (removeButtons.length) {
        removeButtons[0].focus();
      }
    }, 10);
  };

  // Manage focus for removed items.
  const handleItemFocus = (index) => {
    setTimeout(() => {
      const removeButtons = getRemoveButtons();
      const customButton = getCustomButton();

      if (removeButtons.length) {
        if (index < removeButtons.length) {
          removeButtons[index].focus();
        } else if (index - 1 >= 0) {
          removeButtons[index - 1].focus();
        } else if (customButton) {
          customButton.focus();
        }
      } else if (customButton) {
        customButton.focus();
      }
    }, 10);
  };

  // Focus for pager elements.
  const handlePagerFocus = () => {
    setTimeout(() => {
      const pagerSpans = getPagerSpans();
      if (pagerSpans.length) {
        pagerSpans.forEach(span => span.removeAttribute('tabindex'));
        const activeSpan = document.querySelector('.pager > span.active');
        if (activeSpan) {
          activeSpan.tabIndex = 0;
          activeSpan.focus();
        }
      }
    }, 10);
  };

  // Open dialog for custom aid.
  const handleOpenDialog = () => {
    setState(prevState => ({
      ...prevState,
      selectedAidIndex: sge.length,
    }));
    setIsDialogOpen(true);
  };

  // Validate form data.
  const isValidFormData = (formData) => (
    formData && formData.amount && formData.frequency?.value && formData.aidType?.label
  );

  // Close dialog and add new aid if valid
  const handleCloseDialog = (formData, index = -1) => {
    if (!isValidFormData(formData)) {
      setIsDialogOpen(false);
      return;
    }

    const { amount, frequency } = formData;
    const total = frequency.value === 'per_session'
      ? amount * state.sessionRequired
      : frequency.value === 'yearly'
        ? amount * state.yearRequired
        : amount;

    if (total > 0) {
      setState(prevState => ({
        ...prevState,
        aidItems: [...prevState.aidItems, { total, aidType: formData.aidType.label }],
        selectedAidIndex: index >= 0 ? index : sge.length,
      }));
    }
    setIsDialogOpen(false);
    if (index >= 0) handleButtonFocus(index);
  };

  // Remove item and adjust focus.
  const handleRemoveItem = (indexToRemove) => {
    setState(prevState => ({
      ...prevState,
      aidItems: prevState.aidItems.filter((_, index) => index !== indexToRemove),
    }));
    handleItemFocus(indexToRemove);
  };

  // Skip to next page without resetting selectedAidIndex
  const handleSkip = () => {
    setState(prevState => ({
      ...prevState,
      aidItems: [],
      totalAid: 0,
      currentPage: prevState.currentPage + 1,
    }));
    handlePagerFocus();
  };

  return (
    <div className="better-affordability-container">
      <h3 className="header">Scholarships, Grants, and Employer Benefits</h3>
      <p className="sub-description">
        Have you earned scholarships, are you eligible for federal or state grants, or does your employer have a tuition reimbursement or benefits program? The amount you expect to receive per year.
      </p>

      <div className="button-container">
        {sge.length > 0 ? (
          sge.map((item, index) => (
            <button
              key={index}
              onClick={() => handleCloseDialog({
                amount: item.amount,
                aidType: { label: item.name },
                frequency: { value: 'once' }
              }, index)}
              disabled={state.aidItems.length > 0}
              aria-label={`Add ${item.name} aid of $${item.amount.toLocaleString()}`}
              className={`sge-button ${state.selectedAidIndex === index ? 'selected' : ''}`}
            >
              ${item.amount.toLocaleString()} {item.name}
            </button>
          ))
        ) : (
          <button aria-label="Average aid amount">$TBD (Average aid amount)</button>
        )}

        <div className="add-amount-button-container">
          <button
            onClick={handleOpenDialog}
            className={`add-amount-button ${state.selectedAidIndex === sge.length ? 'selected' : ''}`}
            disabled={state.aidItems.length > 0 && state.selectedAidIndex !== sge.length}
            aria-label="Add a custom scholarship, grant, or employer benefit"
          >
            Add Custom Amount
          </button>
        </div>
      </div>

      {state.aidItems.length > 0 && (
        <div className="created-items-list">
          <ul>
            {state.aidItems.map((item, index) => (
              <li key={index} className="created-item">
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="remove-button"
                  aria-label={`Remove ${item.aidType} of $${item.total.toLocaleString()}`}
                >
                  <X size={14} />
                </button>
                <span>${item.total.toLocaleString()} {item.aidType}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="skip-link">
        <button
          onClick={handleSkip}
          className="skip-text"
          aria-label="Skip to the next page without aid"
        >
          <span>Skip (I won't receive aid)</span>
          <ArrowRight className="arrow-icon" size={16} />
        </button>
      </div>

      <AddFundDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        state={state}
        setState={setState}
      />
    </div>
  );
}

export default BetterAffordability;
