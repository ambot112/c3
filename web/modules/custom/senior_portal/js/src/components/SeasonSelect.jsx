import Select from 'react-select';
import React, { useEffect } from 'react';

export function SeasonSelect({state, setState}) {

  const seasonData = state.seasons.map((item) => {
    let description = item.description;
    let startDate = new Date(item.startDate);

    let descriptionParts = description.split(' ');
    let day = startDate.getDate();

    return {
      value: item.termCode,
      label: `${descriptionParts[0]} ${descriptionParts[3] === '2' ? 'II' : 'I'} (${startDate.toLocaleString('en-US', { month: 'short' })} ${day}, ${startDate.getFullYear()})`,
    };
  });

  const handleSeasonChange = (value) => {
    setState(prevState => ({
      ...prevState,
      selectedSeason: value,
    }));
  };

  // Set default season only once when component mounts
  useEffect(() => {
    if (state.selectedSeason === null && seasonData.length > 0) {
      setState(prevState => ({
        ...prevState,
        selectedSeason: seasonData[0],
      }));
    }
  }, [state.selectedSeason, seasonData, setState]);

  return (
    <div className="season">
      <div className="cost-calculator-select">
        <label htmlFor='season-select' id='season-select-label' className='required'>Start Date</label>
        <Select
          placeholder="Select"
          aria-labelledby='season-select-label'
          onChange={(value) => handleSeasonChange(value)}
          options={seasonData}
          value={state.selectedSeason || seasonData[0] || null}
          id="season-select"
          required
        />
      </div>
    </div>
  );
}
