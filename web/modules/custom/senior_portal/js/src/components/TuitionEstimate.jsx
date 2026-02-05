import React from 'react';

export function TuitionEstimate({ state, setState }) {
  const startSeason = state.seasons.find(({ termCode }) => termCode === state.selectedSeason.value);
  const startDate = new Date(startSeason.startDate);
  const estimatedCreditsNeeded = state.programCost.credits - state.transferCredits;
  const sessionsToGraduate = Math.floor(estimatedCreditsNeeded / (3 * state.selectedCoursesPerSeason.value));
  const estimatedTuition = Math.max(0, (estimatedCreditsNeeded * state.programCost.costPerCredit) - state.totalAid);

  // Simple date formatter
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const GridRow = ({ label, value, variant = 'default' }) => {
    return (
      <div className={`grid-row ${variant}`}>
        <div>{label}</div>
        <div className="value">{value}</div>
      </div>
    );
  };

  return (
    <div className="tuition-estimate-container">
      <h3 className="heading">{state.programName}</h3>

      <div className="program-fees-section">
        <div className="program-fees-section__background-image">
        </div>
        {/* Program and Fees Section */}
        <div className="program-fees">
          <GridRow
            label="Estimated Total Credits"
            value={estimatedCreditsNeeded}
          />

          <GridRow
            label="Tuition Fee"
            value={state.military ? 'Military Rate' : 'Standard Rate'}
            variant="alternate"
          />

          <GridRow
            label="Estimated Transfer Credits"
            value={state.transferCredits}
          />

          <GridRow
            label="Scholarships & Assistance"
            value={`${ Number(state.totalAid) > 0 ? '-': ''}$${Number(state.totalAid)}`}
            variant="alternate"
          />

          <GridRow
            label="Estimated Tuition Fee"
            value={`$${estimatedTuition.toLocaleString()}`}
            variant="accent"
          />
        </div>

        {/* Timeline Section */}
        <div className="timeline-section">
          <GridRow
            label="Start Date"
            value={formatDate(startDate)}
            variant="primary"
          />

          <GridRow
            label="Courses per Session"
            value={state.selectedCoursesPerSeason.value}
          />

          <GridRow
            label="# of Sessions to Graduate"
            value={sessionsToGraduate ?? ''}
            variant="alternate"
          />

          <GridRow
            label="Estimated Completion Term"
            value={state.endSeason.endYear ? `${state.endSeason.endSeasonText} ${state.endSeason.endYear}` : 'TBD'}
            variant="accent"
          />
        </div>
      </div>
    </div>
  );
}

export default TuitionEstimate;
