import { HomeAssistant } from "../types.js";
import { CalendarEvent } from "../panels/lovelace/cards/hui-calendar-events-card.js";

export const fetchEvents = (
  hass: HomeAssistant,
  path: string
): Promise<CalendarEvent[]> => hass.callApi("GET", path);

export const fetchCard = (hass: HomeAssistant): Promise<string> =>
  hass.callApi("POST", "lovelace/config/card/get", {
    card_id: "e5f7b484605e4105b4f7c0956b82418b",
  });
