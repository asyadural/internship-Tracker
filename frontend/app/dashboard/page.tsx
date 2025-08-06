'use client';

import useSWR from 'swr';
import { useState, useMemo, useEffect } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { BiSort, BiClipboard } from 'react-icons/bi';
import { FaStar } from 'react-icons/fa';
import AnalyticsComponent from '@/components/AnalyticsComponent';
import CalendarComponent from '@/components/CalendarComponent';

import {
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaCommentDots,
  FaQuestionCircle,
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export interface IInternshipApplication {
  _id: string;
  companyName: string;
  positionTitle?: string;
  location: string;
  applicationDate: string; 
  applicationStatus:
    | 'Applied'
    | 'Interviewing'
    | 'Offer'
    | 'Rejected'
    | 'No Response'
    | 'To Be Applied';
  companyWebsite?: string;
  notes?: string;
}

const STATUS_STYLES = {
  Applied: {
    text: 'Applied',
    color: 'bg-gray-200 text-gray-700',
    icon: <FaStar className="text-yellow-500" />,
  },
  Interviewing: {
    text: 'Interviewing',
    color: 'bg-blue-200 text-blue-700',
    icon: <FaCommentDots className="text-blue-500" />,
  },
  Offer: {
    text: 'Offer',
    color: 'bg-green-200 text-green-700',
    icon: <FaCheckCircle className="text-green-500" />,
  },
  Rejected: {
    text: 'Rejected',
    color: 'bg-red-200 text-red-700',
    icon: <FaTimesCircle className="text-red-500" />,
  },
  'No Response': {
    text: 'No Response',
    color: 'bg-gray-200 text-gray-700',
    icon: <FaQuestionCircle className="text-gray-500" />,
  },
  'To Be Applied': {
    text: 'To Be Applied',
    color: 'bg-gray-200 text-gray-700',
    icon: <BiClipboard className="text-black-500" />,
  },
};

const PAGE_SIZE = 9;

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | IInternshipApplication['applicationStatus']>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'date'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [location, setLocation] = useState('');
  const [applicationDate, setApplicationDate] = useState('');
  const [applicationStatus, setApplicationStatus] = useState<IInternshipApplication['applicationStatus']>('Applied');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<IInternshipApplication>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'analytics'>('grid');

  // Hydration guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      router.replace('/login');
    }
  }, [router]);

  const fetcher = (url: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      });

  const { data: apps, error, mutate } = useSWR<IInternshipApplication[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/applications`,
    fetcher
  );

  // Handlers
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ companyName, positionTitle, location, applicationDate, applicationStatus, companyWebsite, notes }),
    });
    await mutate();
    setShowModal(false);
    setPage(1);
    setCompanyName(''); setPositionTitle(''); setLocation('');
    setApplicationDate(''); setApplicationStatus('Applied');
    setCompanyWebsite(''); setNotes('');
  };

  const updateStatus = async (id: string, newStatus: IInternshipApplication['applicationStatus']) => {
    const token = sessionStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ applicationStatus: newStatus }),
    });
    await mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return;
    const token = sessionStorage.getItem('token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/applications/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await mutate();
  };

  const startEdit = (app: IInternshipApplication) => {
    setEditingId(app._id);
    setDraft({
      positionTitle: app.positionTitle,
      location: app.location,
      applicationDate: app.applicationDate,
      companyWebsite: app.companyWebsite,
      notes: app.notes,
    });
  };
  const cancelEdit = () => { setEditingId(null); setDraft({}); };
  const saveEdit = async (id: string) => {
    const token = sessionStorage.getItem('token');
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(draft),
    });
    await mutate();
    cancelEdit();
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    router.replace('/login');
  };

  // Filtering + sorting
  const visible = useMemo(() => {
    let list = (apps ?? [])
      .filter(a => {
        if (viewMode !== 'grid') return true;
        if (statusFilter === 'all') return true;
        return a.applicationStatus === statusFilter;
      })

      .filter(a => {
        const q = search.toLowerCase();
        return (
          a.companyName.toLowerCase().includes(q) ||
          (a.positionTitle || '').toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
        );
      });
    if (dateFrom) list = list.filter(a => new Date(a.applicationDate) >= new Date(dateFrom));
    if (dateTo)   list = list.filter(a => new Date(a.applicationDate) <= new Date(dateTo));
    list.sort((a, b) => {
      const cmp = sortField === 'name'
        ? a.companyName.localeCompare(b.companyName)
        : new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [apps, statusFilter, search, dateFrom, dateTo, sortField, sortAsc]);

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const paged = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const STATUS_DATE_LABELS: Record<IInternshipApplication['applicationStatus'], string> = {
  Applied: 'Application Date',
  Interviewing: 'Interview Date',
  Offer: 'Offer Date',
  Rejected: 'Rejection Date',
  'No Response': 'Application Date',
  'To Be Applied': 'Target Application Date',
  };

  function getSuggestion(app: IInternshipApplication): string | null {
  const daysSince = Math.floor(
    (Date.now() - new Date(app.applicationDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (app.applicationStatus === 'No Response' && daysSince >= 10) {
    return `You applied ${daysSince} days ago with no response. Consider sending a follow-up email.`;
  }

  if (app.applicationStatus === 'Interviewing' && app.notes?.toLowerCase().includes('waiting')) {
    return `You mentioned waiting for a reply. Consider checking in with the recruiter.`;
  }

  if (app.applicationStatus === 'To Be Applied') {
    return `You marked this for future application. Make sure to apply soon!`;
  }

  if (app.applicationStatus === 'Rejected' && app.notes?.toLowerCase().includes('feedback')) {
    return `You got feedback — use it to improve your resume or next interview.`;
  }

  return null;
}

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-slate-100 font-comfortaa">

      {/* Sidebar */}
      <aside className="w-64 p-6 bg-white shadow-lg border-r border-slate-200">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Trackify</h2>
        <div className="space-y-2">
          {['all', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'No Response', 'To Be Applied'].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s as any); setViewMode('grid'); setPage(1); }}
              className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg font-medium transition-colors ${
                (statusFilter === s && viewMode === 'grid')
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className={`p-1 rounded-full ${s === 'all' ? 'bg-slate-300' : STATUS_STYLES[s as IInternshipApplication['applicationStatus']].color}`}>
                {s === 'all' ? <BiSort className="text-slate-700" /> : STATUS_STYLES[s as IInternshipApplication['applicationStatus']].icon}
              </div>
              <span className="truncate">{s === 'all' ? 'All Applications' : STATUS_STYLES[s as IInternshipApplication['applicationStatus']].text}</span>
            </button>
          ))}
        </div>
        {/* Calendar toggle button */}
        <button
          onClick={() => {setViewMode('calendar');  setStatusFilter('all');}}
          className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg font-medium transition-colors ${
          viewMode === 'calendar' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
>
        <div className="p-1 rounded-full bg-slate-300">📅</div>
              <span>Calendar View</span>
        </button>

        <button
          onClick={() => {setViewMode('analytics'); setStatusFilter('all');}}
          className={`w-full flex items-center gap-3 text-left px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'analytics' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
    📊 <span>Analytics</span>
        </button>
        <button
          onClick={logout}
          className="mt-8 flex items-center text-red-500 hover:text-red-700 font-medium space-x-2 transition-colors"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 p-8 flex flex-col">

        {/* Header */}
        <header className="bg-white p-6 mb-6 rounded-2xl shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              placeholder="🔍 Search applications..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none w-full sm:w-64 transition-all"
            />
            <div className="flex items-center gap-2">
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value as any)}
                className="p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              >
                <option value="name">Sort by Company</option>
                <option value="date">Sort by Date</option>
              </select>
              <button
                onClick={() => setSortAsc(v => !v)}
                className="p-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 transition-colors text-slate-600"
              >
                <BiSort />
              </button>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="p-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-md hover:bg-purple-700 transition-colors w-full md:w-auto"
          >
            + New Application
          </button>
        </header>

        {/* Grid */}
        <main className="flex-1 overflow-auto">
          {error ? (
            <p className="text-red-500 text-center">Error loading applications.</p>
          ) : !apps ? (
            <p className="text-center text-xl text-slate-500">Loading…</p>
          ) : visible.length === 0 ? (
            <p className="text-center text-xl text-slate-500">No applications found.</p>
          ) : (
            <>
            {viewMode === 'calendar' ? (
              <CalendarComponent apps={apps ?? []} />
              ) : viewMode === 'analytics' ? (
                <AnalyticsComponent apps={apps ?? []} />                
            ) : (  
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paged.map(app => {
                  const isEditing = editingId === app._id;
                  return (
                    <div
                      key={app._id}
                      className="p-6 bg-white rounded-3xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-4 ${STATUS_STYLES[app.applicationStatus].color}`}>
                            {STATUS_STYLES[app.applicationStatus].icon}
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800">{app.companyName}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => isEditing ? saveEdit(app._id) : startEdit(app)}
                            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(app._id)}
                            className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {/* Card body */}
                      {isEditing ? (
                        <>
                          <input
                            value={draft.positionTitle || ''}
                            onChange={e => setDraft(d => ({ ...d, positionTitle: e.target.value }))}
                            placeholder="Role"
                            className="w-full mb-2 p-3 border border-slate-300 rounded-lg"
                          />
                          <input
                            value={draft.location || ''}
                            onChange={e => setDraft(d => ({ ...d, location: e.target.value }))}
                            placeholder="Location"
                            className="w-full mb-2 p-3 border border-slate-300 rounded-lg"
                          />
                          <input
                            type="date"
                            value={draft.applicationDate?.slice(0, 10) || ''}
                            onChange={e => setDraft(d => ({ ...d, applicationDate: e.target.value }))}
                            className="w-full mb-2 p-3 border border-slate-300 rounded-lg"
                          />
                          <input
                            value={draft.companyWebsite || ''}
                            onChange={e => setDraft(d => ({ ...d, companyWebsite: e.target.value }))}
                            placeholder="Website"
                            className="w-full mb-2 p-3 border border-slate-300 rounded-lg"
                          />
                          <textarea
                            value={draft.notes || ''}
                            onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
                            placeholder="Notes"
                            rows={3}
                            className="w-full mb-2 p-3 border border-slate-300 rounded-lg"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(app._id)}
                              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex-1 py-3 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-slate-600 mb-1">
                            <strong className="text-slate-800 font-semibold">Role:</strong> {app.positionTitle || '-'}
                          </p>
                          <p className="text-slate-600 mb-1">
                            <strong className="text-slate-800 font-semibold">Location:</strong> {app.location}
                          </p>
                          <p className="text-slate-600 mb-2">
                            <strong className="text-slate-800 font-semibold">
                              {STATUS_DATE_LABELS[app.applicationStatus] || 'Date'}:
                            </strong>{' '}
                            {new Date(app.applicationDate).toLocaleDateString()}
                          </p>
                          {app.companyWebsite && (
                            <p className="text-slate-600 mb-2">
                              <strong className="text-slate-800 font-semibold">Website:</strong>{' '}
                              <a
                                href={app.companyWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-800 hover:underline transition-colors break-words whitespace-normal"
                              >
                                {app.companyWebsite}
                              </a>
                            </p>
                          )}
                          <div className="relative mb-4">
                            <select
                              value={app.applicationStatus}
                              onChange={e => updateStatus(app._id, e.target.value as any)}
                              className={`w-full p-3 rounded-lg border border-slate-300 appearance-none bg-white font-medium ${STATUS_STYLES[app.applicationStatus].color}`}
                            >
                              {Object.entries(STATUS_STYLES).map(([status, sty]) => (
                                <option key={status} value={status}>
                                  {sty.text}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-700">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                          </div>
                          {app.notes && (
                            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                              <strong className="text-slate-800 font-semibold">Notes:</strong> {app.notes}
                            </p>
                          )}
                          {(() => {
                            const suggestion = getSuggestion(app);
                            return suggestion ? (
                              <div className="mt-3 p-3 bg-yellow-100 text-yellow-800 rounded-xl text-sm leading-snug shadow-inner">
      💡                           <strong>Suggestion:</strong> {suggestion}
                              </div>
                            ) : null;
                          })()}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

              {/* Pagination */}
              {viewMode === 'grid' && (
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2 bg-white rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 flex items-center text-slate-600">
                  Page <strong className="font-semibold mx-1 text-slate-800">{page}</strong> of <strong className="font-semibold ml-1 text-slate-800">{totalPages}</strong>
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2 bg-white rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Add New Application Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAdd}
            className="bg-white p-10 rounded-3xl shadow-2xl space-y-6 max-w-lg w-full transform transition-all scale-100"
          >
            <h2 className="text-2xl font-extrabold text-purple-800 text-center">Add New Application</h2>
            <input
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="Company Name"
              required
              className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <input
              value={positionTitle}
              onChange={e => setPositionTitle(e.target.value)}
              placeholder="Position Title"
              className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Location"
              required
              className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <select
              value={applicationStatus}
              onChange={e => setApplicationStatus(e.target.value as any)}
              className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="No Response">No Response</option>
              <option value="To Be Applied">To Be Applied</option>
            </select>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
              {STATUS_DATE_LABELS[applicationStatus]}
              </label>
              <input
                type="date"
                value={applicationDate}
                onChange={e => setApplicationDate(e.target.value)}
                required
                className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <input
              value={companyWebsite}
              onChange={e => setCompanyWebsite(e.target.value)}
              placeholder="Company Website"
              className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes"
              rows={3}
              className="w-full p-4 border border-slate-300 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-md hover:bg-purple-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
      <style jsx global>{`.fc .fc-day-today { background-color: #fce7f3 !important;
        }`}</style>
    </div>
  );
}
