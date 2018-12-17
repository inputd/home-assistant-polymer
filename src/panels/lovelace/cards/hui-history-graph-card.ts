import { html, LitElement, PropertyDeclarations } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

import "../../../components/ha-card";
import "../../../components/state-history-charts";
import "../../../data/ha-state-history-data";

import { HomeAssistant } from "../../../types";
import { LovelaceCard, LovelaceCardEditor } from "../types";
import { LovelaceCardConfig } from "../../../data/lovelace";
import { processConfigEntities } from "../common/process-config-entities";

export interface ConfigEntity {
  entity: string;
  name?: string;
}

export interface Config extends LovelaceCardConfig {
  title?: string;
  entities: ConfigEntity[];
  hours_to_show?: number;
  refresh_interval?: number;
}

class HuiHistoryGraphCard extends LitElement implements LovelaceCard {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("../editor/config-elements/hui-history-graph-card-editor");
    return document.createElement("hui-history-graph-card-editor");
  }

  public static getStubConfig(): object {
    return { entities: [] };
  }

  public hass?: HomeAssistant;
  private _config?: Config;
  private _entities?: string[];
  private _names?: object;
  private _cacheConfig?: object;
  private _stateHistory?: object;

  static get properties(): PropertyDeclarations {
    return {
      hass: {},
      _config: {},
      _stateHistory: {},
    };
  }

  public getCardSize(): number {
    return 4;
  }

  public setConfig(config: Config): void {
    const entities = processConfigEntities(config.entities);
    this._config = { hours_to_show: 24, refresh_interval: 0, ...config };
    this._entities = [];
    this._names = {};
    for (const entity of entities) {
      this._entities.push(entity.entity);
      if (entity.name) {
        this._names[entity.entity] = entity.name;
      }
    }
    this._cacheConfig = {
      cacheKey: this._entities.sort().join(),
      hoursToShow: config.hours_to_show || 24,
      refresh: config.refresh_interval || 0,
    };
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) {
      return html``;
    }

    return html`
      ${this.renderStyle()}
      <ha-card .header="${this._config.title}">
        <ha-state-history-data
          filter-type="recent-entity"
          .hass="${this.hass}"
          .data="${this._stateHistory}"
          .entityId="${this._entities}"
          .cacheConfig="${this._cacheConfig}"
          @change="${this._valueChanged}"
        ></ha-state-history-data>
        <state-history-charts
          up-to-now
          no-single
          .hass="${this.hass}"
          .names="${this._names}"
          .historyData="${this._stateHistory}"
        ></state-history-charts>
      </ha-card>
    `;
  }

  private renderStyle(): TemplateResult {
    return html`
      <style>
        ha-card {
          padding: 16px;
        }
        ha-card[header] {
          padding-top: 0;
        }
      </style>
    `;
  }

  private _valueChanged(ev: Event): void {
    if (!this._config || !this.hass) {
      return;
    }

    this._stateHistory = ev.target!;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-history-graph-card": HuiHistoryGraphCard;
  }
}

customElements.define("hui-history-graph-card", HuiHistoryGraphCard);
