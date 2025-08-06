'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { IInternshipApplication } from '@/app/dashboard/page';

export default function CalendarComponent({ apps }: { apps: IInternshipApplication[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        events={apps.map(app => ({
          title: app.companyName,
          date: app.applicationDate,
          start: app.applicationDate,
          allDay: true,
          backgroundColor:
            app.applicationStatus === 'Interviewing'
              ? '#bfdbfe'
              : app.applicationStatus === 'Offer'
              ? '#bbf7d0'
              : app.applicationStatus === 'Applied'
              ? '#fef9c3'
              : app.applicationStatus === 'Rejected'
              ? '#fecaca'
              : app.applicationStatus === 'To Be Applied'
              ? '#e0e7ff'
              : '#e5e7eb',
          textColor: '#1f2937',
          extendedProps: { status: app.applicationStatus },
        }))}
        eventContent={({ event }) => (
          <div className="text-left whitespace-normal leading-tight">
            <div className="font-semibold">{event.title}</div>
            <div className="text-sm text-gray-700">{event.extendedProps.status}</div>
          </div>
        )}
      />
    </div>
  );
}