import { html, LitElement, PropertyDeclarations } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

import "../components/hui-generic-entity-row";

import timerTimeRemaining from "../../../common/entity/timer_time_remaining";
import secondsToDuration from "../../../common/datetime/seconds_to_duration";
import { EntityRow, EntityConfig } from "./types";
import { HomeAssistant } from "../../../types";
import { HassEntity } from "home-assistant-js-websocket";

class HuiTimerEntityRow extends LitElement implements EntityRow {
  public hass?: HomeAssistant;
  private _config?: EntityConfig;
  private _timeRemaining?: number;

  static get properties(): PropertyDeclarations {
    return {
      hass: {},
      _config: {},
      _timeRemaining: {},
    };
  }

  public setConfig(config: EntityConfig): void {
    if (!config || !config.entity) {
      throw new Error("Invalid Configuration: 'entity' required");
    }

    this._config = config;
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._clearInterval();
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-error-entity-row
          .entity="${this._config.entity}"
        ></hui-error-entity-row>
      `;
    }

    return html`
      <hui-generic-entity-row .hass="${this.hass}" .config="${this._config}">
        <div>${this._computeDisplay(stateObj, this._timeRemaining!)}</div>
      </hui-generic-entity-row>
    `;
  }

  static get timerControlTemplate() {
    return html`
      <div>[[_computeDisplay(_stateObj, _timeRemaining)]]</div>
    `;
  }

  private _stateObjChanged(stateObj: HassEntity) {
    if (stateObj) {
      this._startInterval(stateObj);
    } else {
      this._clearInterval();
    }
  }

  private _clearInterval() {
    if (this._updateRemaining) {
      clearInterval(this._updateRemaining);
      this._updateRemaining = null;
    }
  }

  private _startInterval(stateObj: HassEntity) {
    this._clearInterval();
    this._calculateRemaining(stateObj);

    if (stateObj.state === "active") {
      this._updateRemaining = setInterval(
        () => this._calculateRemaining(this._stateObj),
        1000
      );
    }
  }

  private _calculateRemaining(stateObj) {
    this._timeRemaining = timerTimeRemaining(stateObj);
  }

  private _computeDisplay(stateObj: HassEntity, time: number) {
    if (!stateObj) {
      return null;
    }

    if (stateObj.state === "idle" || time === 0) {
      return stateObj.state;
    }

    let display = secondsToDuration(time);

    if (stateObj.state === "paused") {
      display += " (paused)";
    }

    return display;
  }

  private _computeStateObj(states, entityId) {
    return states && entityId in states ? states[entityId] : null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-timer-entity-row": HuiTimerEntityRow;
  }
}

customElements.define("hui-timer-entity-row", HuiTimerEntityRow);
