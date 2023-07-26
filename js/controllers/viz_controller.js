import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js";

export default class extends Controller {
  static targets = ["wrapper"];

  updateViz(businesses) {
    const topLevelBranches = this.groupByTopLevel(businesses);
    const countedBranches = this.countOccurrences(topLevelBranches);
    const sortedBranches = this.sortByOccurrences(countedBranches);
    const topBranches = sortedBranches.slice(0, 3);
    this.insertViz(topBranches);
  }

  groupByTopLevel(businesses) {
    const topLevels = [];

    businesses.forEach((businesses) => {
      topLevels.push(businesses.properties.ihk_branch_desc);
    });
    return topLevels;
  }

  countOccurrences(branches) {
    const count = (arr) =>
      arr.reduce((ac, a) => ((ac[a] = ac[a] + 1 || 1), ac), {});
    return count(branches);
  }

  sortByOccurrences(branches) {
    return Object.entries(branches).sort(
      ([, occurrencesForA], [, occurrencesForB]) => {
        return occurrencesForB - occurrencesForA;
      }
    );
  }

  insertViz(topBranches) {
    const maxOccurences = topBranches
      .map(([_, occurrences]) => occurrences)
      .sort(
        (occurrencesForA, occurrencesForB) => occurrencesForA < occurrencesForB
      )[0];

    const getBarWidthByOccurrences = (occurrences) => {
      return (100 / maxOccurences) * occurrences;
    };

    const vizChildren = [];

    topBranches.forEach(([branch, occurrences]) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("viz__label-wrapper");

      const labelTooltipWrapper = document.createElement("sl-tooltip");
      labelTooltipWrapper.setAttribute("content", branch);

      const labelElement = document.createElement("span");
      labelElement.textContent = branch;
      labelElement.classList.add("viz__branch-label");

      labelTooltipWrapper.appendChild(labelElement);

      const occurrencesElement = document.createElement("span");
      occurrencesElement.textContent = occurrences;
      occurrencesElement.classList.add("viz__occurences-label");

      const barElement = document.createElement("span");
      barElement.classList.add("viz__bar");
      barElement.style.width = `${getBarWidthByOccurrences(occurrences)}%`;

      wrapper.appendChild(labelTooltipWrapper);
      wrapper.appendChild(occurrencesElement);
      wrapper.appendChild(barElement);

      vizChildren.push(wrapper);
    });

    this.wrapperTarget.replaceChildren(...vizChildren);
  }
}
