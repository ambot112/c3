import Select from 'react-select';

export function ProgramSelector({
  state,
  degreeLevelOptions,
  programOptions,
  handleChange,
  loadingProgramList,
}) {

  const formatOptionLabel = ({ value, label, caOnly }) => {
    if (caOnly) {
      return (
        <div>
          {label} <span className="ca-only-pill-wrapper"><span className="ca-only-pill">CA only</span></span>
        </div>
      );
    }
    return <div>{label}</div>;
  };

  return (
    <div className='page-1'>
      {/* Degree Level Selector */}
      <div className="cost-calculator-select">
        <label htmlFor='program-degree-level' id='program-degree-level-label' className='required'>Degree Level</label>
        <Select
          placeholder='Select'
          aria-labelledby='program-degree-level-label'
          options={degreeLevelOptions}
          onChange={handleChange('degreeLevel')}
          value={degreeLevelOptions.find(option => option.value === state.degreeLevel)}
          isDisabled={loadingProgramList || state.isAdmin}
          required
          id='program-degree-level'
        />
      </div>

      {/* Program Selector */}
      <div className="cost-calculator-select">
        <label htmlFor='program-select' id='program-select-label' className='required'>Program</label>
        <Select
          placeholder='Select'
          aria-labelledby='program-select-label'
          options={programOptions}
          onChange={handleChange('programCode')}
          formatOptionLabel={formatOptionLabel}
          value={state.programCode ? programOptions.find(option => option.value === state.programCode) : null}
          isDisabled={state.isAdmin}
          required
          id='program-select'
        />
      </div>

      {/* Military Checkbox */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name='military'
          checked={state.military}
          onChange={handleChange('military')}
        />
        <span>I'm active-duty military or spouse</span>
      </label>
    </div>
  );
}
