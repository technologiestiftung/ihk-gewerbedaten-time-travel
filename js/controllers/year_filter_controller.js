import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

export default class extends Controller {
  static targets = ["input", "label", "toggle"];

  static outlets = ["map"];

  connect() {
    this.updateYearLabel(this.initialYear);
  }

  change(event) {
    this.updateYearLabel(event.target.value);

    const selectedYear = parseInt(event.target.value, 10);
    const minBusinessAge = this.maxYear - selectedYear;
    this.sendToAgeFilter(minBusinessAge);
  }

  sendToAgeFilter(minAge) {
    this.mapOutlet.updateFilters({ minAge });
  }

  updateYearLabel(year) {
    this.labelTarget.textContent = year;
  }

  toggleAutoplay(event) {
    const currentlyPlaying = event.params.playing;

    if (
      currentlyPlaying ||
      parseInt(this.inputTarget.value, 10) >= this.maxYear
    ) {
      this.stopAdvancingYear();
      event.target.dataset.yearFilterPlayingParam = false;
    } else {
      this.advanceYear();
      event.target.dataset.yearFilterPlayingParam = true;
    }
  }

  advanceYear() {
    this.yearInterval = setInterval(() => {
      const newYear = parseInt(this.inputTarget.value, 10) + 1;

      this.sendToAgeFilter(this.maxYear - newYear);
      this.updateYearLabel(newYear);
      this.inputTarget.value = newYear;
    }, 800);

    this.toggleTarget.textContent = "Pause";
  }

  stopAdvancingYear() {
    if (this.yearInterval) {
      clearInterval(this.yearInterval);
    }
    this.toggleTarget.textContent = "Play";
  }

  get maxYear() {
    return this.inputTarget.getAttribute("max");
  }

  get initialYear() {
    return this.inputTarget.value;
  }
}
