import axios from 'axios';
import bot_creds from '../creds/bot_creds.json' assert { type: 'json' };
import { calendar_v3 } from 'googleapis';
import { z } from 'zod';

type LabEventModel = {
    eventSummary: string;
    eventDescription: string;
    startTime: Date;
    endTime: Date;
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
    description: z.string().optional().transform(e => e ?? "No description"),
    summary: z.string()
});


/**
 * Attempts to connect to the google calendar
 * @param newCalendarId id of the new calendar
 * @returns title of the calendar
 * @throws ExpectedCalendarErrors if
 * - API request fails
 * - API request times out
 */
async function checkCalendarConnection(newCalendarId: string): Promise<string> {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const calendarUrl = buildCalendarURL({
        calendarId: newCalendarId,
        timeMin: new Date(),
        timeMax: nextWeek,
        apiKey: bot_creds.googleCalendarAPIKey,
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

async function fetchUpcomingLabEvents(): Promise<LabEventModel[]> {
    // Make API Request
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const calendarUrl = buildCalendarURL({
        calendarId: bot_creds.googleCalendarID,
        apiKey: bot_creds.googleCalendarAPIKey,
        timeMin: new Date(),
        timeMax: nextWeek,
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

        // now build all the viewModels from this calendar string
        viewModels.push({
            eventSummary: parsedEvent.description,
            eventDescription: parsedEvent.summary,
            startTime: new Date(parsedEvent.start.dateTime),
            endTime: new Date(parsedEvent.end.dateTime)
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
function buildCalendarURL(args: {
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

export { checkCalendarConnection, buildCalendarURL, fetchUpcomingLabEvents };
