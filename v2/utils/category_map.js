const category_map = require("./category_map.json");

function getCategoryName(category_id) {
  for (let i = 0; i < category_map.length; i++) {
    if (category_map[i].category_id === category_id) {
      return category_map[i].category_name;
    }
  }

  return null;
}

module.exports = {
  getCategoryName,
};
