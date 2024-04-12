import axios from 'axios';
import { botCreds } from '../file-loader.js';
import { calendar_v3 } from 'googleapis';
import { z } from 'zod';
import { roomInfo } from '../client.js';

enum LabEventType {
    Class,
    OpenLab,
    Meeting,
    Event
}

type LabEventModel = {
    eventSummary: string;
    eventDescription: string;
    startTime: Date;
    endTime: Date;
    eventType: LabEventType;
};

/**
 * Validation schema for data coming from the google api
 */
const calendarDataSchema = z.object({
    start: z.object({
        dateTime: z.string()
    }),
    end: z.object({
        dateTime: z.string()
    }),
    description: z
        .string()
        .optional()
        .transform(e => e ?? 'No description'),
    summary: z.string()
});

class CalendarInfo {
    static instance: CalendarInfo;

    private currentEvents: LabEventModel[] = [];

    private constructor() {}

    public static getInstance(): CalendarInfo {
        if (!CalendarInfo.instance) {
            CalendarInfo.instance = new CalendarInfo();
        }
        return CalendarInfo.instance;
    }

    public getCurrentEvents(): LabEventModel[] {
        return this.currentEvents;
    }

    public initCalendarRefreshTimer() {
        // refresh every minute
        this.refreshCalendar();
        console.log('Setting up calendar refresh timer');
        setInterval(this.refreshCalendar.bind(this), 1000 * 60);
    }

    public async refreshCalendar() {
        console.log('Refreshing calendar');
        this.currentEvents = await this.fetchUpcomingLabEvents();
        roomInfo.updateDisplays();
    }

    /**
     * Attempts to connect to the google calendar
     * @param newCalendarId id of the new calendar
     * @returns title of the calendar
     * @throws ExpectedCalendarErrors if
     * - API request fails
     * - API request times out
     */
    public async checkCalendarConnection(newCalendarId: string): Promise<string> {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const calendarUrl = this.buildCalendarURL({
            calendarId: newCalendarId,
            timeMin: new Date(),
            timeMax: nextWeek,
            apiKey: botCreds.googleCalendarAPIKey,
            maxResults: 2
        });

        const response = await axios
            .get(calendarUrl, {
                timeout: 5000, // 5 second timeout
                method: 'GET'
            })
            .catch(e => {
                throw new Error('Timed out' + e.message);
            });
        if (response.status !== 200) {
            throw new Error('Failed request');
        }
        const responseJSON = await response.data;
        // it's just checking for connection
        // so it's not really worth it to pass through the schema checker
        return (responseJSON as calendar_v3.Schema$Events).summary ?? '';
    }

    private async fetchUpcomingLabEvents(): Promise<LabEventModel[]> {
        // Make API Request
        const endOfDayPST = new Date();

        // translate to America/Los_Angeles timezone
        endOfDayPST.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });

        // set to end of day
        endOfDayPST.setHours(23, 59, 59, 999);

        const calendarUrl = this.buildCalendarURL({
            calendarId: botCreds.googleCalendarID,
            apiKey: botCreds.googleCalendarAPIKey,
            timeMin: new Date(),
            timeMax: endOfDayPST,
            maxResults: 100 // change this value to fetch more
        });
        const response = await axios
            .get(calendarUrl, {
                timeout: 5000,
                method: 'GET'
            })
            .catch(() => {
                throw new Error('Timed out');
            });
        if (response.status !== 200) {
            throw new Error('Failed request');
        }

        const rawEvents = ((await response.data) as calendar_v3.Schema$Events).items;
        if (!rawEvents || rawEvents.length === 0) {
            return [];
        }

        // Parse into lab event model
        const viewModels: LabEventModel[] = [];
        for (const rawEvent of rawEvents) {
            const unpack = calendarDataSchema.safeParse(rawEvent);

            if (!unpack.success) {
                continue;
            }
            const parsedEvent = unpack.data;

            // determine the type of event based on keywords in the description
            let eventType: LabEventType;
            if (parsedEvent.summary.toLowerCase().includes('class')) {
                eventType = LabEventType.Class;
            } else if (parsedEvent.summary.toLowerCase().includes('open lab')) {
                eventType = LabEventType.OpenLab;
            } else if (parsedEvent.summary.toLowerCase().includes('meeting')) {
                eventType = LabEventType.Meeting;
            } else {
                eventType = LabEventType.Event;
            }

            // now build all the viewModels from this calendar string
            viewModels.push({
                eventSummary: parsedEvent.summary,
                eventDescription: parsedEvent.description,
                startTime: new Date(parsedEvent.start.dateTime),
                endTime: new Date(parsedEvent.end.dateTime),
                eventType
            });
        }
        return viewModels;
    }

    /**
     * Builds the calendar URL
     * @param args.calendar_id id to the PUBLIC calendar
     * @param args.apiKey apiKey found in calendar-config.ts
     * @param args.timeMin the start of the date range
     * @param args.timeMax the end of the date range
     */
    private buildCalendarURL(args: {
        calendarId: string;
        apiKey: string;
        timeMin: Date;
        timeMax: Date;
        maxResults: number;
    }): string {
        return [
            `https://www.googleapis.com/calendar/v3/calendars/${args.calendarId}/events?`,
            `&key=${args.apiKey}`,
            `&maxResults=${args.maxResults.toString()}`,
            `&timeMax=${args.timeMax.toISOString()}`,
            `&timeMin=${args.timeMin.toISOString()}`,
            `&orderBy=startTime`,
            `&singleEvents=true`
        ].join('');
    }
}

export { CalendarInfo, LabEventModel, LabEventType };
