export function TuitionInfo({ levelDescription, programCost }) {
  return (
    <div className='page-2'>
      <h3>
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
        {levelDescription} Tuition Rate
      </h3>
      <p>Based on your selections, your estimate will be calculated based on the <span>{levelDescription} Tuition Rate:</span></p>
      <p>
        <b>${programCost && programCost.costPerCredit ? new Intl.NumberFormat('en-US').format(programCost.costPerCredit * 3) : ''}</b> average cost per course
        <br />
        (<b>${programCost && programCost.costPerCredit ? new Intl.NumberFormat('en-US').format(programCost.costPerCredit) : ''}</b> per credit x 3 credits per course)
      </p>
      <p>The tuition cost estimate is based on the fees of the current academic year. Actual tuition costs may change based on future rates.</p>
    </div>
  );
}
