import { html, LitElement } from "@polymer/lit-element";

import { LovelaceCard, LovelaceConfig } from "../types";
import { TemplateResult } from "lit-html";
import { HomeAssistant } from "../../../types";
import { fetchEvents, fetchCard } from "../../../data/calendar-events";

interface Config extends LovelaceConfig {
  title?: string;
  entities: string[];
}

export interface CalendarEvent {
  id: number;
  summary?: string;
  description?: string;
  location?: string;
  start?: string;
  startDate?: Date;
  end?: string;
  endDate?: Date;
  fullDay?: boolean;
}

class HuiCalendarEventsCard extends LitElement implements LovelaceCard {
  private _config?: Config;
  private _hass?: HomeAssistant;
  private _events?: CalendarEvent[];

  static get properties() {
    return {
      _config: {},
      _events: {},
    };
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;

    // TODO Get events and see if they have changed. Only apply to events object if they have so we don't render too often
    this._fetchAllEvents();
    fetchCard(this._hass);
  }

  public getCardSize(): number {
    return 3;
  }

  public setConfig(config: Config): void {
    if (!config.entities) {
      throw new Error("Invalid Configuration: 'entities' must be defined");
    }

    this._config = config;

    if (!this._events) {
      this._events = [];
    }
  }

  protected render(): TemplateResult {
    if (!this._config || !this._events) {
      return html``;
    }
    // TODO Put events into a map by date
    // TODO If no upcoming events, say so instead of not displaying the card
    // TODO Divider card between days
    // If first event on day, render date
    // If last event on day, render divider
    return html`
      ${this.renderStyle()}
      <ha-card .header="${this._config.title}">
        ${this._events!.map(
          (event) => html`
            <li>${event.summary}</li>
            <div class="divider"></div>
          `
        )}
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
        .day-wrapper {
          border-bottom: 1px solid;
          margin-bottom: 10px;
        }

        .day-wrapper:last-child {
          border-bottom: none;
        }

        .day {
          display: flex;
          flex-direction: row;
          width: 100%;
        }

        .date {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: top;
          flex: 0 1 40px;
        }

        .events {
          flex: 1 1 auto;
        }

        .event-wrapper {
          padding: 5px;
          margin-left: 10px;
        }

        .event {
          flex: 0 1 auto;
          display: flex;
          flex-direction: column;
        }

        .info {
          display: flex;
          width: 100%;
          justify-content: space-between;
          flex-direction: row;
        }

        .congrats {
          cursor: pointer;
        }

        .time {
          font-size: smaller;
          color: var(--primary-color);
        }

        .now {
          color: var(--paper-item-icon-color, #44739e);
        }

        hr.now {
          border-style: solid;
          border-color: var(--primary-color);
          border-width: 1px 0 0 0;
          margin-top: -9px;
          margin-left: 5px;
        }

        ha-icon {
          color: var(--paper-item-icon-color, #44739e);
        }

        ha-icon.now {
          height: 16px;
          width: 16px;
        }
      </style>
    `;
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
    this._events! = await fetchEvents(
      this._hass!,
      `calendars/${entity}?start=2018-11-03T00:00:00Z&end=2018-12-02T00:00:00Z`
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
    "hui-calendar-events-card": HuiCalendarEventsCard;
  }
}

customElements.define("hui-calendar-events-card", HuiCalendarEventsCard);
