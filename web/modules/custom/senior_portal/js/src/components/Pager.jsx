export function Pager({ currentPage }) {
  const pages = Array.from({ length: 7 }, (_, i) => i + 1);

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

  const removePagerFocus = () => {
    for (var i = 0; i < document.querySelectorAll('#cost-calculator-app .left-content .pager > span').length; i++) {
      document.querySelectorAll('#cost-calculator-app .left-content .pager > span')[i].removeAttribute('tabindex');
    }
  };

  return (
    <div className="pager">
      {pages.map(page => (

        <span
          key={page}
          className={page === currentPage ? 'active' : ''}
          aria-label={stepLabels[page]}
          onBlur={removePagerFocus}
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
        </span>
      ))}
    </div>
  );
}
