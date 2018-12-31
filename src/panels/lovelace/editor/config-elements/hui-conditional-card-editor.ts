import { html, LitElement, PropertyDeclarations } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-toggle-button/paper-toggle-button";

import { struct } from "../../common/structs/struct";
import { hassLocalizeLitMixin } from "../../../../mixins/lit-localize-mixin";
import { HomeAssistant } from "../../../../types";
import { LovelaceCardEditor } from "../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { Config, Condition } from "../../cards/hui-conditional-card";
import { configElementStyle } from "./config-elements-style";

const conditionStruct = struct({
  entity: "entity-id",
  state: "string?",
  state_not: "string?",
});

const cardConfigStruct = struct({
  type: "string",
  card: "object?",
  conditions: [conditionStruct],
});

export class HuiConditionalCardEditor extends hassLocalizeLitMixin(LitElement)
  implements LovelaceCardEditor {
  static get properties(): PropertyDeclarations {
    return { hass: {}, _config: {} };
  }

  get _conditions(): Condition[] {
    return this._config!.conditions || [];
  }

  public hass?: HomeAssistant;
  private _config?: Config;

  public setConfig(config: Config): void {
    config = cardConfigStruct(config);
    this._config = config;
  }

  protected render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    return html`
      ${configElementStyle}
      <div class="card-config">
        <hui-condition-editor
          .hass="${this.hass}"
          .conditions="${this._conditions}"
          .configValue="${"conditions"}"
          @conditions-changed="${this._valueChanged}"
        ></hui-condition-editor>
      </div>
    `;
  }

  private _valueChanged(ev: Event): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target! as EditorTarget;

    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === "") {
        delete this._config[target.configValue!];
      } else {
        this._config = { ...this._config, [target.configValue!]: target.value };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-conditional-card-editor": HuiConditionalCardEditor;
  }
}

customElements.define("hui-conditional-card-editor", HuiConditionalCardEditor);
