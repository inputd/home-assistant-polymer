import { html, LitElement, PropertyDeclarations } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";
import "@polymer/paper-input/paper-textarea";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";

import "../../../components/ha-service-picker";

import { HomeAssistant } from "../../../types";
import { fireEvent, HASSDomEvent } from "../../../common/dom/fire_event";
import { EditorTarget } from "../editor/types";
import { PaperInputElement } from "@polymer/paper-input/paper-input";
import { configElementStyle } from "../editor/config-elements/config-elements-style";

declare global {
  // for fire event
  interface HASSDomEvents {
    "value-changed": undefined;
  }
  // for add event listener
  interface HTMLElementEventMap {
    "value-changed": HASSDomEvent<undefined>;
  }
}

export class HuiImageEditor extends LitElement {
  public value?: string | { [key: string]: string };
  public images?: string[];
  public configValue?: string;
  protected hass?: HomeAssistant;

  static get properties(): PropertyDeclarations {
    return { hass: {}, value: {}, images: {}, configValue: {} };
  }

  get _value(): string | { [key: string]: string } {
    return this.value || this.configValue === "state_image" ? {} : "";
  }

  get _configValue(): string {
    return this.configValue || "image";
  }

  protected render(): TemplateResult {
    if (!this.hass || !this.images) {
      return html``;
    }
    return html`
    ${configElementStyle}
      <paper-dropdown-menu
        label=Image Type"
        .configValue="${"image_type"}"
        @value-changed="${this._typeChanged}"
      >
        <paper-listbox
          slot="dropdown-content"
          .selected="${this.images.indexOf(this._configValue!)}"
        >
          ${this.images.map((action) => {
            return html`
              <paper-item>${action}</paper-item>
            `;
          })}
        </paper-listbox>
      </paper-dropdown-menu>
      ${
        this._configValue === "image"
          ? html`
              <paper-input
                label="Image Url"
                .value="${this._value}"
                .configValue="${"image"}"
                @value-changed="${this._valueChanged}"
              ></paper-input>
            `
          : ""
      }
      ${
        this._configValue === "camera_image"
          ? html`
              <ha-entity-picker
                .hass="${this.hass}"
                .value="${this._value}"
                .configValue=${"camera_image"}
                domain-filter="camera"
                @change="${this._valueChanged}"
              ></ha-entity-picker>
            `
          : ""
      }
      ${
        this._configValue === "state_image"
          ? html`
              <h3>State Images</h3>
              ${
                Object.keys(this._value).forEach((key) => {
                  return html`
                    <div class="side-by-side">
                      <paper-input label="State" value="${key}"></paper-input>
                      <paper-input
                        label="Image Url"
                        value="${this._value[key]}"
                      ></paper-input>
                    </div>
                  `;
                })
              }
              <div class="side-by-side">
                <paper-input id="keyInput" label="State"></paper-input>
                <paper-input id="valueInput" label="Image Url"></paper-input>
                <paper-button
                  @click="${this._valueChanged}"
                  .configValue="${"state_image"}"
                  >Add Data
                </paper-button>
              </div>
            `
          : ""
      }
    `;
  }

  private _keyInput(): PaperInputElement {
    return this.shadowRoot!.getElementById("keyInput") as PaperInputElement;
  }

  private _valueInput(): PaperInputElement {
    return this.shadowRoot!.getElementById("valueInput") as PaperInputElement;
  }

  private _typeChanged(ev: Event): void {
    if (!this.hass) {
      return;
    }
    const target = ev.target! as EditorTarget;
    this.configValue = target.value;
    this.value = this.configValue === "state_image" ? {} : "";
    fireEvent(this, "value-changed");
  }

  private _valueChanged(ev: Event): void {
    if (!this.hass) {
      return;
    }
    const target = ev.target! as EditorTarget;
    if (this.configValue === "state_image") {
      if (this._value[this._keyInput().value!] === this._valueInput().value) {
        return;
      }
      const data = this._value;
      data[this._keyInput().value!] = this._valueInput().value;
      this.value = data;
      this._keyInput().value = "";
      this._valueInput().value = "";
    } else {
      if (this._value === target.value) {
        return;
      }
      this.value = target.value;
    }

    fireEvent(this, "value-changed");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-image-editor": HuiImageEditor;
  }
}

customElements.define("hui-image-editor", HuiImageEditor);
