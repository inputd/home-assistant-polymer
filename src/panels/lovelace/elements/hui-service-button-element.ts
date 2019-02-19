import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  CSSResult,
  css,
} from "lit-element";
import "@material/mwc-button";

import { LovelaceElement, LovelaceElementConfig } from "./types";
import { HomeAssistant } from "../../../types";

@customElement("hui-button-element")
export class HuiButtonElement extends LitElement implements LovelaceElement {
  @property() public hass?: HomeAssistant;
  @property() private _config?: LovelaceElementConfig;

  public setConfig(config: LovelaceElementConfig): void {
    if (!config) {
      throw Error("Invalid Configuration");
    }

    // TODO tap/hold action validators

    this._config = config;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity];

    return html`
      <ha-call-service-button
        .hass="${this.hass}"
        .domain="${this._domain}"
        .service="${this._service}"
        .serviceData="${this._config.service_data}"
        >${this._config.title}</ha-call-service-button
      >
      <mwc-button>
        ${this._config.name !== "false"
          ? this._config.name || computeStateName(stateObj)
          : ""}
      </mwc-button>
    `;
  }

  static get styles(): CSSResult {
    return css`
      mwc-button {
        color: var(--primary-color);
        white-space: nowrap;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-button-element": HuiButtonElement;
  }
}
