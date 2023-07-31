export const BUSINESSES_TILESET_PROPERTIES = {
  age: "business_age",
  branch: "branch_top_level_desc",
};

export const isValidAge = (age) => {
  return age >= 0;
};

export const getSelectedAge = () => {
  const yearInput = document.querySelector(".year-filter sl-range");
  const maxYear = yearInput.getAttribute("max");
  const selectedYear = yearInput.value;

  return parseInt(maxYear, 10) - parseInt(selectedYear, 10);
};

export const getBusinessInceptionYear = (businessAge) => {
  const yearInput = document.querySelector(".year-filter sl-range");
  const maxYear = yearInput.getAttribute("max");
  return parseInt(maxYear, 10) - businessAge;
};

export const replaceUnderscoresWithSpaces = (input) => {
  return input.replaceAll("_", " ");
};
