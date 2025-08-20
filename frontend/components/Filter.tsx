import { IInternshipApplication } from '@/app/dashboard/page';

export type StatusFilter = 'all' | IInternshipApplication['applicationStatus'];
export type SortField = 'name' | 'date';

export type ComputeVisibleParams = {
  apps: IInternshipApplication[];
  viewMode: 'grid' | 'calendar' | 'analytics';
  statusFilter: StatusFilter;
  search: string;
  dateFrom?: string; // yyyy-mm-dd
  dateTo?: string;   // yyyy-mm-dd
  sortField: SortField;
  sortAsc: boolean;
  page: number;
  pageSize: number;
};

const toMidnight = (d: string) => new Date(d + 'T00:00:00');

const matchesSearch = (a: IInternshipApplication, q: string) => {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    a.companyName.toLowerCase().includes(s) ||
    (a.positionTitle || '').toLowerCase().includes(s) ||
    a.location.toLowerCase().includes(s)
  );
};

const inDateRange = (
  a: IInternshipApplication,
  from?: string,
  to?: string
) => {
  const d = new Date(a.applicationDate);
  if (from && d < toMidnight(from)) return false;
  if (to && d > toMidnight(to)) return false;
  return true;
};

export const filterApps = (
  apps: IInternshipApplication[],
  viewMode: ComputeVisibleParams['viewMode'],
  statusFilter: StatusFilter,
  search: string,
  dateFrom?: string,
  dateTo?: string
) => {
  return apps
    .filter(a => (viewMode !== 'grid' || statusFilter === 'all' ? true : a.applicationStatus === statusFilter))
    .filter(a => matchesSearch(a, search))
    .filter(a => inDateRange(a, dateFrom, dateTo));
};

export const sortApps = (
  apps: IInternshipApplication[],
  sortField: SortField,
  sortAsc: boolean
) => {
  const arr = [...apps];
  arr.sort((a, b) => {
    const cmp =
      sortField === 'name'
        ? a.companyName.localeCompare(b.companyName)
        : new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
    return sortAsc ? cmp : -cmp;
  });
  return arr;
};

export const paginate = <T,>(items: T[], page: number, pageSize: number) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  return { page: safePage, totalPages, slice: items.slice(start, end) };
};

export const computeVisible = (params: ComputeVisibleParams) => {
  const filtered = filterApps(
    params.apps,
    params.viewMode,
    params.statusFilter,
    params.search,
    params.dateFrom,
    params.dateTo
  );
  const sorted = sortApps(filtered, params.sortField, params.sortAsc);
  const { page, totalPages, slice } = paginate(sorted, params.page, params.pageSize);
  return { visible: sorted, paged: slice, page, totalPages };
};

export function getSuggestion(app: IInternshipApplication): string | null {
  const daysSince = Math.floor(
  (Date.now() - new Date(app.applicationDate).getTime()) / (1000 * 60 * 60 * 24)
);

 if (app.applicationStatus === 'No Response' && daysSince >= 10) {
  return `You applied ${daysSince} days ago with no response. Consider sending a follow-up email.`;
}

 if (app.applicationStatus === 'Interviewing') {
  return `You mentioned waiting for a reply. Consider checking in with the recruiter.`;
}

 if (app.applicationStatus === 'To Be Applied') {
  return `You marked this for future application. Make sure to apply soon!`;
}

 if (app.applicationStatus === 'Rejected') {
  return `Improve your resume for your next interview.`;
}
 if(app.applicationStatus === "Applied" && daysSince >=90){
  return  `You applied ${daysSince} days ago with no response. Consider applying again.`;
 }

 return null;
}