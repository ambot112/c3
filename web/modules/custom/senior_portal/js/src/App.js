'use client';
import './App.scss';
import React, { useState, useEffect } from 'react';
import { ProgramSelector } from './components/ProgramSelector';
import { TuitionInfo } from './components/TuitionInfo';
import { Timeline } from './components/Timeline';
import { Pager } from './components/Pager';
import { CostSummary } from './components/CostSummary';
import { BetterAffordability } from './components/BetterAffordability';
import { AffordabilityInfo } from './components/AffordabilityInfo';
import { TransferCredits } from './components/TransferCredits';
import { TuitionEstimate } from './components/TuitionEstimate';
import { usePrograms } from './hooks/usePrograms';

function App() {

  // Declare a state variable for degreeLevel and programCode that can be updated later
  const [settings, setSettings] = useState(null);

  const [state, setState] = useState({
    degreeLevel: null,
    interest: null,
    programCode: null,
    programName: null,
    military: false,
    levelDescription: null,
    currentPage: 1,
    programCost: [],
    seasons: [],
    selectedSeason: [],
    selectedCoursesPerSeason: {value: 1},
    endSeason: [],
    transferCredits: 0,
    sessionRequired: 0,
    yearRequired: 0,
    totalAid: 0,
    aidItems: [],
    selectedAidIndex: null,
    isAdmin: false,
  });

  const { programList, creditsCostList, degreeLevelOptions, programOptions, loadingProgramList, loadingCreditsCostList, blockConfigs } = usePrograms(state);

  // Effect hook to read from Drupal's settings and set degreeLevel and programCode
  useEffect(() => {
    const settingsData = window?.drupalSettings?.umass_calculator;
    if (settingsData) {
      setSettings(settingsData);
      setState((prevState) => ({
        ...prevState,
        degreeLevel: settingsData.degree_level || null,
        programCode: settingsData.program_code || null,
        isAdmin: settingsData.is_admin || false,
      }));
    }
  }, []);

  // Handle changes in user selections
  const handleChange = (key) => (event) => {
    setState((prevState) => ({
      ...prevState,
      [key]: event.value || event.target.checked,
      ...(key === 'degreeLevel' && { interest: null, programCode: null, programCost: [], selectedSeason: null, endSeason:[], totalAid: 0, }),
      ...(key === 'programCode' && { programCost: [], selectedSeason: null, endSeason:[], totalAid: 0, }),
    }));
  };

  const handlePrint = () => {
    window.print(); // This will trigger the print dialog
  };

  const handlePagerFocus = () => {
    setTimeout(() => {
      if (document.querySelectorAll('#cost-calculator-app .left-content').length) {
        for (var i = 0; i < document.querySelectorAll('#cost-calculator-app .left-content .pager > span').length; i++) {
          document.querySelectorAll('#cost-calculator-app .left-content .pager > span')[i].removeAttribute('tabindex');
        }
        document.querySelectorAll('#cost-calculator-app .left-content .pager > span.active')[0].tabIndex = 0;
        document.querySelectorAll('#cost-calculator-app .left-content .pager > span.active')[0].focus();
      }
    }, 10);
  };

  const handleStartOver = () => {
    // Reset form state or perform any other reset logic
    setState({
      degreeLevel: settings?.degree_level ?? null,
      interest: null,
      programCode: settings?.program_code ?? null,
      programName: null,
      military: false,
      levelDescription: null,
      currentPage: 1,
      programCost: [],
      seasons: [],
      selectedSeason: [],
      selectedCoursesPerSeason: {value: 1},
      endSeason: [],
      transferCredits: 0,
      sessionRequired: 0,
      yearRequired: 0,
      totalAid: 0,
      aidItems: [],
      selectedAidIndex: null,
      isAdmin: false,
    });

    handlePagerFocus();
  };

  // Step labels.
  const stepLabels = {
    1: 'Degree',
    2: 'Tuition Rate',
    3: 'Start Date',
    4: 'Transfer Credits from Experience',
    5: 'Scholarships, Grants, and Employer Benefits',
    6: 'Do You Work for One of Our Partners?',
    7: 'Summary',
  };

  // Handle navigation to the next page
  const handleNext = (event) => {
    event.preventDefault();
    const selectedProgram = programList.find(({ programCode }) => programCode === state.programCode);
    const selectedProgramCost = creditsCostList.find(({ programCode }) => programCode === state.programCode);

    if (selectedProgram) {
      setState((prevState) => ({
        ...prevState,
        currentPage: prevState.currentPage + 1,
        programName: selectedProgram.programName,
        levelDescription: selectedProgram.levelDescription,
        programCost: selectedProgramCost,
        seasons: selectedProgram.sessionList,
      }));
    }

    if (state.currentPage === 3 && (state.programCost.maxCreditTransfer === null || state.programCost.maxCreditTransfer === 0)) {
      setState(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1
      }));
    }

    handlePagerFocus();
  };

  // Handle navigation to the previous page
  const handlePrev = (event) => {
    event.preventDefault();
    setState((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage - 1,
    }));

    if (state.currentPage === 5 && (state.programCost.maxCreditTransfer === null || state.programCost.maxCreditTransfer === 0)) {
      setState(prev => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }

    handlePagerFocus();
  };

  // Render dynamic component based on current page
  const renderPage = () => {
    switch (state.currentPage) {
      case 1:
        return (
          <ProgramSelector
            state={state}
            degreeLevelOptions={degreeLevelOptions}
            programOptions={programOptions}
            handleChange={handleChange}
            loadingProgramList={loadingProgramList}
          />
        );
      case 2:
        return <TuitionInfo levelDescription={state.levelDescription} programCost={state.programCost} />;
      case 3:
        return <Timeline state={state} setState={setState} />;
      case 4:
        return <TransferCredits state={state} setState={setState} />;
      case 5:
        return <BetterAffordability state={state} setState={setState} blockConfigs={blockConfigs} />;
      case 6:
        return <AffordabilityInfo state={state} setState={setState} blockConfigs={blockConfigs} />;
      case 7:
        return <TuitionEstimate state={state} setState={setState} />;
      default:
        return null;
    }
  };

  return (
    <div className="cost-calculator-wrapper">
      <div className="cost-calculator-wrapper__row">
        <div
          className={`${state.currentPage !== 7 ? 'left-content' : 'left-content no-summary'}`}
        >

          <Pager currentPage={state.currentPage} />
          {renderPage()}

          <div className="navigation-buttons">
            {state.currentPage !== 1 && state.currentPage !== 7 && (
              <button aria-label={"Back to '" + stepLabels[(state.currentPage - 1)] + "' step"} type="submit" className="navigation-buttons__prev" onClick={handlePrev} disabled={!state.programCode}>
                Back
              </button>
            )}

            {state.currentPage !== 7 && state.currentPage !== 3 && (
              <button aria-label={"Next to '" + stepLabels[(state.currentPage + 1)] + "' step"} type="submit" className="navigation-buttons__next" onClick={handleNext} disabled={!state.programCode || loadingCreditsCostList}>
                Next
              </button>
            )}

            {state.currentPage === 3 && (
              <button aria-label={"Next to '" + stepLabels[(state.currentPage + 1)] + "' step"} type="submit" className="navigation-buttons__next" onClick={handleNext} disabled={state.selectedSeason === null || state.selectedCoursesPerSeason.value === undefined}>
                Next
              </button>
            )}

            {state.currentPage === 7 && (
              <div className="tw-flex tw-self-end end-navigation">
                <button
                  className="tw-text-center tw-text-[#3C3C3C] tw-mr-6 tw-no-underline hover:tw-no-underline tw-cursor-pointer"
                  onClick={handlePrint} // Placeholder for actual print functionality
                >
                  Print/Save
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M128 0C92.7 0 64 28.7 64 64l0 96 64 0 0-96 226.7 0L384 93.3l0 66.7 64 0 0-66.7c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0L128 0zM384 352l0 32 0 64-256 0 0-64 0-16 0-16 256 0zm64 32l32 0c17.7 0 32-14.3 32-32l0-96c0-35.3-28.7-64-64-64L64 192c-35.3 0-64 28.7-64 64l0 96c0 17.7 14.3 32 32 32l32 0 0 64c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-64zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>
                </button>
                <button
                  className="tw-text-center tw-text-[#3C3C3C] tw-no-underline hover:tw-no-underline tw-cursor-pointer"
                  onClick={handleStartOver} // Placeholder for start-over functionality
                >
                  Start Over
                  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.5 1.5V6C14.5 6.5625 14.0312 7 13.5 7H9C8.4375 7 8 6.5625 8 6C8 5.46875 8.4375 5 9 5H10.9688C10.0312 3.78125 8.5625 3.03125 6.96875 3.03125C4.21875 3.03125 2 5.25 2 8C2 10.7812 4.21875 13 6.96875 13C8.0625 13 9.09375 12.6562 9.96875 12C10.4062 11.6875 11.0312 11.7812 11.375 12.2188C11.7188 12.6562 11.625 13.2812 11.1875 13.625C9.96875 14.5312 8.5 15 6.96875 15C3.125 15 0 11.875 0 8C0 4.15625 3.125 1.03125 6.96875 1.03125C9.15625 1.03125 11.1562 2.03125 12.5 3.71875V1.5C12.5 0.96875 12.9375 0.5 13.5 0.5C14.0312 0.5 14.5 0.96875 14.5 1.5Z" fill="#1E2832"/>
                  </svg>
                </button>
              </div>
            )}

            {state.currentPage === 7 && (
              <div className="tw-flex tw-self-end tw-w-[144px] end-submit">
                <a
                  href={blockConfigs.apply_now_url ?? "/forms/umass-global-online-application"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:no-underline"
                >
                  <button className="tw-w-[144px] tw-border-none tw-bg-[#FFCE00] tw-font-semibold tw-cursor-pointer tw-h-[48px] tw-text-[#3C3C3C] tw-text-[16px] hover:tw-bg-[#FFCE00] hover:tw-text-[#9D2235]">
                    Apply Now
                  </button>
                </a>
              </div>
            )}
          </div>
        </div>

        {state.currentPage !== 7 && (
          <CostSummary
            state={state}
            setState={setState}
          />
        )}
      </div>
      {/* Display on 4 page but available on print */}
      <div
        style={{ display: state.currentPage === 4 ? 'block' : 'none' }}
        className='bottom-credit-slider-text'
        dangerouslySetInnerHTML={{ __html: blockConfigs.bottom_slider_text?.value || '' }}
      />
      {/* Note all page. */}
      <div className='cost-calculator-wrapper__bottom-text' dangerouslySetInnerHTML={{ __html: blockConfigs.bottom_text?.value || '' }} />
    </div>
  );
}

export default App;
