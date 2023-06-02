const map_state_to_code = (state_code) => {};

function mergeData(data) {
  const mergedData = {};

  for (const entry of data) {
    const key = entry[0];
    const value = entry[1];
    const abbr = entry[2];

    if (mergedData[key]) {
      mergedData[key] += value;
    } else {
      mergedData[key] = value;
    }
  }

  return Object.entries(mergedData);
}

module.exports = {
  mergeData,
  map_state_to_code,
};
