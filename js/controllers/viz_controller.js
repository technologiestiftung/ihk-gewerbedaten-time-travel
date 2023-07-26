import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.1/dist/stimulus.js";

export default class extends Controller {
  static targets = ["wrapper"];

  updateViz(businesses) {
    const topLevels = this.groupByTopLevel(businesses);
    const count = this.countOccurrences(topLevels);
    const sorted = this.sortByOccurrence(count);
    const topTenBranches = sorted.slice(0, 3);
    this.insertViz(topTenBranches);
  }

  groupByTopLevel(businesses) {
    const topLevels = [];

    businesses.forEach((businesses) => {
      topLevels.push(businesses.properties.ihk_branch_desc);
    });
    return topLevels;
  }

  countOccurrences(topLevels) {
    const count = (arr) =>
      arr.reduce((ac, a) => ((ac[a] = ac[a] + 1 || 1), ac), {});
    return count(topLevels);
  }

  sortByOccurrence(topLevels) {
    return Object.entries(topLevels).sort((a, b) => {
      const aCount = a[1];
      const bCount = b[1];
      return bCount - aCount;
    });
  }

  insertViz(topBranches) {
    const maxOccurences = topBranches
      .map(([_, occurrences]) => occurrences)
      .sort((a, b) => a < b)[0];

    const getWidthByOccurrences = (occurrences) => {
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
      barElement.style.width = `${getWidthByOccurrences(occurrences)}%`;

      wrapper.appendChild(labelTooltipWrapper);
      wrapper.appendChild(occurrencesElement);
      wrapper.appendChild(barElement);

      vizChildren.push(wrapper);
    });

    this.wrapperTarget.replaceChildren(...vizChildren);
  }
}
