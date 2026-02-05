import Select from 'react-select';

export function CoursePerSeason({state, setState}) {

  const coursesPerSeason = [
    {value: 1, label: '1'},
    {value: 2, label: '2'},
    {value: 3, label: '3'},
  ];

  const handleSeasonChange = (value) => {
    setState(prevState => ({
      ...prevState,
      selectedCoursesPerSeason: value,
    }));
  };

  return (
    <div className="courses-per-session">
      <div className="cost-calculator-select">
        <label htmlFor='course-per-session-select' id='course-per-session-select-label' className='required'>Courses per Session</label>
        <Select
          placeholder="Select"
          aria-labelledby='course-per-session-select-label'
          onChange={(value) => handleSeasonChange(value)}
          defaultValue={coursesPerSeason[state.selectedCoursesPerSeason.value || 1]}
          options={coursesPerSeason}
          id="course-per-session-select"
          required
        />
      </div>
    </div>
  );
}
