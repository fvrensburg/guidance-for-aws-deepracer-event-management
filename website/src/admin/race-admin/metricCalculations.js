const getRaceSummary = (lapsPerRace) => {
  const allLaps = lapsPerRace.flat();
  return allLaps.reduce((prevValue, lap) => {
    let slowestTime = lap.time;
    let fasestTime = lap.time;

    if ('slowestTime' in prevValue) {
      slowestTime = prevValue.slowestTime < lap.time ? lap.time : prevValue.slowestTime;
    }
    if ('fasestTime' in prevValue) {
      fasestTime = prevValue.fasestTime > lap.time ? lap.time : prevValue.fasestTime;
    }

    return {
      resets: prevValue.resets + lap.resets,
      laps: prevValue.laps ? prevValue.laps + 1 : 1,
      slowestTime: slowestTime,
      fasestTime: fasestTime,
      timeSum: prevValue.timeSum ? prevValue.timeSum + lap.time : lap.time,
    };
  });
};

export const calculateMetrics = (races) => {
  const lapsPerRace = races.map((race) => race.laps);
  const summary = getRaceSummary(lapsPerRace);
  const numberOfRaces = races.length;
  console.info(summary);
  return {
    totalLaps: summary.laps,
    totalresets: summary.resets,
    avgresestsPerLap: (summary.resets / summary.laps).toPrecision(1),
    avgLapsPerRace: (summary.laps / numberOfRaces).toPrecision(1),
    avgLapTime: parseInt(summary.timeSum / summary.laps),
    fastestLap: summary.fasestTime,
    slowestLap: summary.slowestTime,
  };
};
