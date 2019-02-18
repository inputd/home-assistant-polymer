import {
  html,
  LitElement,
  TemplateResult,
  property,
  CSSResult,
  css,
  customElement,
} from "lit-element";

import "../components/hui-generic-entity-row";
import "../components/hui-timestamp-display";
import "../components/hui-warning";

import { HomeAssistant } from "../../../types";
import { EntityRow, EntityConfig } from "./types";
import { longPress } from "../common/directives/long-press-directive";
import { handleClick } from "../common/handle-click";

import computeStateDisplay from "../../../common/entity/compute_state_display";

interface SensorEntityConfig extends EntityConfig {
  format?: "relative" | "date" | "time" | "datetime";
}

@customElement("hui-sensor-entity-row")
class HuiSensorEntityRow extends LitElement implements EntityRow {
  @property() public hass?: HomeAssistant;

  @property() private _config?: SensorEntityConfig;

  public setConfig(config: SensorEntityConfig): void {
    if (!config) {
      throw new Error("Configuration error");
    }
    this._config = config;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning
          >${this.hass.localize(
            "ui.panel.lovelace.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }

    return html`
      <hui-generic-entity-row
        .hass="${this.hass}"
        .config="${this._config}"
        @ha-click="${this._handleTap}"
        @ha-hold="${this._handleHold}"
        .longPress="${longPress()}"
      >
        <div>
          ${stateObj.attributes.device_class === "timestamp"
            ? html`
                <hui-timestamp-display
                  .hass="${this.hass}"
                  .ts="${new Date(stateObj.state)}"
                  .format="${this._config.format}"
                ></hui-timestamp-display>
              `
            : computeStateDisplay(
                this.hass!.localize,
                stateObj,
                this.hass.language
              )}
        </div>
      </hui-generic-entity-row>
    `;
  }

  static get styles(): CSSResult {
    return css`
      div {
        text-align: right;
      }
    `;
  }

  private _handleTap() {
    handleClick(this, this.hass!, this._config!, false);
  }

  private _handleHold() {
    handleClick(this, this.hass!, this._config!, true);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-sensor-entity-row": HuiSensorEntityRow;
  }
}
