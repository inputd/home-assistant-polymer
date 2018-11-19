import { html, LitElement } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

import { LovelaceCard, LovelaceConfig } from "../types";
import { HomeAssistant } from "../../../types";
import { fetchEvents, CalendarEvent } from "../../../data/calendar-events";

interface Config extends LovelaceConfig {
  title?: string;
  entities: string[];
}

class HuiAgendaCard extends LitElement implements LovelaceCard {
  private _hass?: HomeAssistant;
  private _config?: Config;
  private _events?: CalendarEvent[];
  private _lastUpdated?: Date;

  static get properties() {
    return {
      _config: {},
      _events: {},
    };
  }

  protected constructor() {
    super();
    this._events = [];
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    const now = new Date();

    if (
      !this._lastUpdated ||
      Math.abs(now.getTime() - this._lastUpdated.getTime()) > 300000
    ) {
      this._lastUpdated = now;
      this._fetchAllEvents();
    }
  }

  public getCardSize(): number {
    return 3;
  }

  public setConfig(config: Config): void {
    if (!config.entities) {
      throw new Error("Invalid Configuration: 'entities' must be defined");
    }

    this._config = config;
  }

  protected render(): TemplateResult {
    if (!this._config || !this._events) {
      return html``;
    }
    // If first event on day, and no previous event render divider
    // If first event on day, render date
    return html`
      ${this.renderStyle()}
      <ha-card .header="${this._config.title}">
        ${
          this._events.length > 0
            ? html`
                ${
                  this._events!.map(
                    (event) => html`
                      <span>${this._formatDate(event)}</span>
                      <span
                        >${
                          event.start!.date
                            ? event.start!.date
                            : event.start!.dateTime
                        }</span
                      >
                      <span>
                        ${event.start!.date ? "All Day" : event.start!.dateTime}
                      </span>
                      <span>${event.summary}</span>
                      <div class="divider"></div>
                    `
                  )
                }
              `
            : html`
                <span>No Upcoming Events</span>
              `
        }
      </ha-card>
    `;
  }

  private renderStyle(): TemplateResult {
    return html`
      <style>
        .divider {
          height: 1px;
          background-color: var(--divider-color);
          margin: 10px;
        }
      </style>
    `;
  }

  private _formatDate(event: CalendarEvent): string {
    const d = new Date(
      event.start!.date ? event.start!.date! : event.start!.dateTime!
    );

    return d.toDateString();
  }

  private _fetchAllEvents(): void {
    if (this._hass) {
      this._config!.entities.forEach((entity) => {
        this._fetchEntityEvents(entity);
      });
      // this._events!.sort(
      //   (a: CalendarEvent, b: CalendarEvent) =>
      //     new Date(a.start) - new Date(b.start)
      // );
    }
  }

  private async _fetchEntityEvents(entity: string): Promise<void> {
    // TODO Need to append to array
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    this._events = await fetchEvents(
      this._hass!,
      `calendars/${entity}?start=${startDate.getFullYear()}-${startDate.getMonth() +
        1}-${startDate.getDate()}T00:00:00Z&end=${endDate.getFullYear()}-${endDate.getMonth() +
        1}-${endDate.getDate()}T00:00:00Z`
    );
  }

  // private _sortEvents(): void {
  //   this._events!.sort((a: CalendarEvent, b: CalendarEvent) =>
  //     if (a.start)
  //   );
  // }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-agenda-card": HuiAgendaCard;
  }
}

customElements.define("hui-agenda-card", HuiAgendaCard);
