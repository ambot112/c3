import { useState, useEffect, useMemo, useCallback } from 'react';

export function usePrograms(state) {
  const [programList, setProgramList] = useState([]);
  const [creditsCostUndiscountedList, setCreditsCostUndiscountedList] = useState([]);
  const [creditsCostDiscountedList, setCreditsCostDiscountedList] = useState([]);
  const [creditsCostList, setCreditsCostList] = useState([]);
  const [blockConfigs, setBlockConfigs] = useState([]);

  // Separate loading states for each request.
  const [loadingProgramList, setLoadingProgramList] = useState(true);
  const [loadingCreditsCostList, setLoadingCreditsCostList] = useState(true);

  const [error, setError] = useState(null);

  // Consolidated fetch function for credits and cost list.
  const fetchCreditsCostListData = useCallback(async (url, setCreditsCostData) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch credits and cost data: ${response.status}`);
      }

      const data = await response.json();
      setCreditsCostData(data);
    } catch (error) {
      console.error('Error fetching credits and cost list:', error);
      setError(error.message);
    } finally {
      setLoadingCreditsCostList(false);
    }
  }, []);

  // Fetch program list.
  useEffect(() => {
    let mounted = true;
    setLoadingProgramList(true);
    setError(null);

    const fetchProgramList = async () => {
      try {
        const response = await fetch('/umass_api/api/program-list', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Program list fetch failed: ${response.status}`);
        }

        const data = await response.json();

        if (mounted) {
          setProgramList(data);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error fetching program list:', error);
          setError(error.message);
        }
      } finally {
        if (mounted) {
          setLoadingProgramList(false);
        }
      }
    };

    fetchProgramList();

    return () => {
      mounted = false;
    };
  }, []); // This effect runs once when the component mounts.

  // Fetch credits and cost list for both undiscounted and discounted.
  useEffect(() => {
    setLoadingCreditsCostList(true);
    setError(null);

    fetchCreditsCostListData('/umass_api/api/credits-and-cost-list', setCreditsCostUndiscountedList);
    fetchCreditsCostListData('/umass_api/api/credits-and-cost-list-discounted', setCreditsCostDiscountedList);

  }, [fetchCreditsCostListData]);

  useEffect(() => {
    // Determine which credits cost list to use based on military status.
    if (state.military) {
      setCreditsCostList(creditsCostDiscountedList);
    } else {
      setCreditsCostList(creditsCostUndiscountedList);
    }
  }, [state.military, creditsCostDiscountedList, creditsCostUndiscountedList]);

  // Set block configs.
  useEffect(() => {
    const fetchBlockConfigs = async () => {
      try {
        const response = await fetch('/umass_api/api/block_config', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        if (!response.ok) {
          throw new Error(`Block configs fetch failed: ${response.status}`);
        }
        const data = await response.json();
        setBlockConfigs(data);
      } catch (error) {
        console.error('Error fetching block configs:', error);
        setError(error.message);
      }
    };

    fetchBlockConfigs();
  }, []);

  // Memoize degree level options.
  const degreeLevelOptions = useMemo(() => {
    const options = new Set();
    programList.forEach(({ levelDescription, sessions }) => {
      if (sessions !== null && levelDescription !== 'Certificates & Courses') {
        options.add(levelDescription);
      }
    });
    return Array.from(options).sort().map(value => ({ value, label: value }));
  }, [programList]);

  // Memoize program options based on degree level.
  const programOptions = useMemo(() => {
    const options = new Set();

    for (const { programName, levelDescription, programCode, sessions, includedStates } of programList) {
      // Check if `programCode` does not exists in `creditsCostList`
      if (creditsCostList.length > 0 && !creditsCostList.find(({ programCode: code }) => String(code) === String(programCode))) {
        continue;
      }

      if (state.degreeLevel === levelDescription && sessions !== null) {
        options.add({ value: programCode, label: programName, caOnly: includedStates === 'CA' });
      }
    }

    return Array.from(options).sort((a, b) => a.label.localeCompare(b.label));
  }, [programList, state.degreeLevel, creditsCostList]);

  return {
    programList,
    creditsCostList,
    degreeLevelOptions,
    programOptions,
    loadingProgramList,
    loadingCreditsCostList,
    blockConfigs,
    error
  };
}
