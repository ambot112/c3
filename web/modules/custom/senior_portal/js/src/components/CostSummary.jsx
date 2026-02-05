import React, { useEffect, useState } from 'react';

export function CostSummary({ state, setState }) {
  const [formattedCost, setFormattedCost] = useState('0');

  useEffect(() => {
    // Calculate the formatted cost when program cost, credits, and transfer credits change.
    if (state.programCost?.costPerCredit && state.programCost?.credits) {
      const rawCost = (state.programCost.costPerCredit * (state.programCost.credits - state.transferCredits)) - (state.totalAid || 0);
      // Ensure cost is not negative.
      const cost = Math.max(0, rawCost);
      // Update formatted cost.
      setFormattedCost(cost.toLocaleString());
    } else {
      // Set cost to '0' if there's no program cost or credits.
      setFormattedCost('0');
    }
  }, [state.programCost, state.transferCredits, state.totalAid]);

  useEffect(() => {
    // Calculate the end season, session, and year based on selected season and courses.
    if (state.selectedSeason !== null && state.termCode !== null) {
      const startSeason = state.seasons.find(({ termCode }) => termCode === state.selectedSeason.value);
      if (startSeason) {
        const startDate = new Date(startSeason.startDate);
        const credits = state.programCost?.credits - state.transferCredits || 0;

        // Calculate session and year required.
        const sessionRequired = Math.floor(credits / (3 * state.selectedCoursesPerSeason.value));
        const daysRequired = sessionRequired * 8 * 7;

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + daysRequired);

        const endYear = endDate.getFullYear();
        // 0-based (0 = January, 11 = December)
        const endMonth = endDate.getMonth();

        let endSeasonText = '';
        switch (endMonth) {
          case 0:
          case 1:
          case 2:
          case 3:
            endSeasonText = 'Spring';
            break;
          case 4:
          case 5:
          case 6:
          case 7:
            endSeasonText = 'Summer';
            break;
          case 8:
          case 9:
          case 10:
          case 11:
            endSeasonText = 'Fall';
            break;
          default:
            endSeasonText = 'Unknown';
        }

        // Calculate years required (from sessions)
        const yearRequired = Math.floor((sessionRequired * 8 * 7) / 365);

        // Update state with calculated end season, session, and year.
        setState(prevState => ({
          ...prevState,
          endSeason: {
            endYear,
            endSeasonText,
          },
          sessionRequired,
          yearRequired,
        }));
      }
    }
  }, [state.selectedCoursesPerSeason, state.selectedSeason, state.programCost?.credits, state.seasons, state.transferCredits, state.termCode, setState]);

  useEffect(() => {

    // Reset timeline if the user is not on the page that requires it.
    if (state.currentPage < 3) {
      setState(prevState => ({
        ...prevState,
        selectedCoursesPerSeason: {value: 1},
      }));
    }

    // Reset transferCredits if the user is not on the page that requires it.
    if (state.currentPage < 4) {
      setState(prevState => ({
        ...prevState,
        transferCredits: 0,
      }));
    }

    // Reset aidItems if the user is not on the page that requires it.
    if (state.currentPage < 5) {
      setState(prevState => ({
        ...prevState,
        aidItems: [],
        selectedAidIndex: null,
      }));
    }

    if (state.currentPage === 1 && state.programCode === null) {
      setState(prevState => ({
        ...prevState,
        selectedSeason: null,
        endSeason: [],
      }));
    }
  }, [state.currentPage, state.programCode, setState]);

  return (
    <div className="right-content">
      <div className="right-content__container">
        <div className="right-content__background-image">
        </div>
        <div className="right-content__summary">
          <div className="estimated-credits">
            <span>Estimated Credits</span>
            <span>{state.programCost?.credits - state.transferCredits || 0}</span>
          </div>
          <div className="estimated-tuition-charge">
            <span>Tuition Charge</span>
            <span className="total-estimated-cost">
              ${formattedCost}
            </span>
          </div>
          <div className="estimated-gradiation">
            <span>Estimated Graduation Term</span>
            {/* Display end season and year if available */}
            {state.endSeason?.endSeasonText && state.endSeason?.endYear ? (
              <div>
                <span>{state.endSeason.endSeasonText}</span>
                <span>{state.endSeason.endYear}</span>
              </div>
            ) : (
              <span>TBD</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostSummary;
