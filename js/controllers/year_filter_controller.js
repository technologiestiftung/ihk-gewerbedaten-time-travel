import { Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js";

export default class extends Controller {
  static targets = ["input", "label", "toggle"];

  static values = {
    initialYear: String,
    referenceYear: {
      type: Number,
      default: 2023,
    },
  };

  static outlets = ["map"];

  connect() {
    this.updateYearLabel(this.initialYearValue);
  }

  change(event) {
    this.updateYearLabel(event.target.value);

    const selectedYear = parseInt(event.target.value, 10);
    const minBusinessAge = this.referenceYearValue - selectedYear;
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

    switch (true) {
      case currentlyPlaying:
        this.stopAdvancingYear();
        event.target.dataset.yearFilterPlayingParam = false;
        break;
      case !currentlyPlaying && this.inputTarget.value === "2023":
        break;
      default:
        this.advanceYear();
        event.target.dataset.yearFilterPlayingParam = true;
        break;
    }
  }

  advanceYear() {
    this.yearInterval = setInterval(() => {
      const slider = document.getElementById("slider");
      const currentSliderValue = slider.value;
      const newYear = parseInt(currentSliderValue, 10) + 1;

      if (newYear >= 2023) this.stopAdvancingYear();

      this.sendToAgeFilter(2023 - newYear);
      this.updateYearLabel(newYear);
      slider.value = newYear;
    }, 800);

    this.toggleTarget.textContent = "Pause";
  }

  stopAdvancingYear() {
    if (this.yearInterval) {
      clearInterval(this.yearInterval);
    }
    this.toggleTarget.textContent = "Play";
  }
}
