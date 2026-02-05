import { SeasonSelect } from './SeasonSelect';
import { CoursePerSeason } from './CoursePerSeason';

export function Timeline({ state, setState }) {

  return (
    <div className="page-3">
      <h3>Start Date</h3>
      <div className="tw-flex timeline">
        <SeasonSelect
          state={state}
          setState={setState}
        />
        <CoursePerSeason
          state={state}
          setState={setState}
        />
      </div>
    </div>
  );
}
