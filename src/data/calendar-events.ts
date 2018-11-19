import { HomeAssistant } from "../types.js";

export interface CalendarEvent {
  id: number;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    date?: string;
    dateTime?: string;
  };
  startDate?: Date;
  end?: string;
  endDate?: Date;
  fullDay?: boolean;
}

export const fetchEvents = (
  hass: HomeAssistant,
  path: string
): Promise<CalendarEvent[]> => hass.callApi("GET", path);
