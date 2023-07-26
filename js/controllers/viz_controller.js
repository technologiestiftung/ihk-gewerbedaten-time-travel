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

  insertViz(counts) {
    const newChildren = [];

    counts.forEach((countEl) => {
      const li = document.createElement("li");
      li.textContent = `${countEl[0]} (${countEl[1]})`;
      newChildren.push(li);
    });

    this.wrapperTarget.replaceChildren(...newChildren);
  }
}
