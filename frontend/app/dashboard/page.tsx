'use client';

import useSWR from 'swr';
import { useState, useMemo } from 'react';
import { FiSettings } from 'react-icons/fi';
import { BiSort } from 'react-icons/bi';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCommentDots,
  FaQuestionCircle,
} from 'react-icons/fa';

// Define the type matching your backend model
export interface IInternshipApplication {
  _id?: string;
  companyName: string;
  positionTitle?: string;
  location: string;
  applicationDate: string; // ISO date string
  applicationStatus:
    | 'Applied'
    | 'Interviewing'
    | 'Offer'
    | 'Rejected'
    | 'No Response';
  companyWebsite?: string;
  notes?: string;
}

// Map status to Tailwind classes and icons
const STATUS_STYLES = {
  Applied: {
    text: 'Applied',
    color: 'bg-gray-400',
    icon: <FaQuestionCircle className="text-gray-600" />,
  },
  Interviewing: {
    text: 'Interviewing',
    color: 'bg-blue-400',
    icon: <FaCommentDots className="text-blue-600" />,
  },
  Offer: {
    text: 'Offer',
    color: 'bg-green-400',
    icon: <FaCheckCircle className="text-green-600" />,
  },
  Rejected: {
    text: 'Rejected',
    color: 'bg-red-400',
    icon: <FaTimesCircle className="text-red-600" />,
  },
  'No Response': {
    text: 'No Response',
    color: 'bg-gray-400',
    icon: <FaQuestionCircle className="text-gray-600" />,
  },
};

// SWR fetcher that sends the auth cookie automatically
const fetcher = (url: string) =>
  fetch(url, {
    credentials: 'include',
  }).then(res => {
    if (!res.ok) {
      const err: any = new Error('Failed to fetch');
      err.status = res.status;
      throw err;
    }
    return res.json();
  });

export default function DashboardPage() {
  // 1) Fetch all applications (cookie is sent automatically)
  const {
    data: apps,
    error,
    mutate,
  } = useSWR<IInternshipApplication[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/applications`,
    fetcher
  );

  // Filters & sort state
  const [
    statusFilter,
    setStatusFilter,
  ] = useState<'all' | IInternshipApplication['applicationStatus']>(
    'all'
  );
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal & form state
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [location, setLocation] = useState('');
  const [applicationDate, setApplicationDate] = useState('');
  const [
    applicationStatus,
    setApplicationStatus,
  ] = useState<IInternshipApplication['applicationStatus']>('Applied');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [notes, setNotes] = useState('');

  // Add‐application handler
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/applications`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName,
            positionTitle,
            location,
            applicationDate,
            applicationStatus,
            companyWebsite,
            notes,
          }),
        }
      );
      await mutate(); // re-fetch
      setShowModal(false);

      // reset form
      setCompanyName('');
      setPositionTitle('');
      setLocation('');
      setApplicationDate('');
      setApplicationStatus('Applied');
      setCompanyWebsite('');
      setNotes('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit application.');
    }
  };

  // Compute filtered + sorted list
  const visible = useMemo(() => {
    const list = apps ?? [];
    return list
      .filter(
        app =>
          (statusFilter === 'all' ||
            app.applicationStatus === statusFilter) &&
          app.companyName
            .toLowerCase()
            .includes(search.toLowerCase())
      )
      .sort((a, b) =>
        sortAsc
          ? a.companyName.localeCompare(b.companyName)
          : b.companyName.localeCompare(a.companyName)
      );
  }, [apps, statusFilter, search, sortAsc]);

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-indigo-300 via-sky-300 to-purple-300 font-comfortaa">
      {/* Sidebar */}
      <aside className="w-64 bg-white/70 backdrop-blur-lg border-r-4 border-white border-opacity-60 p-6 space-y-4 z-10 rounded-r-[3rem] shadow-xl">
        <h2 className="text-3xl font-extrabold text-blue-600 font-bubblegum tracking-wide mb-4">
          Applications
        </h2>
        {['all', 'Applied', 'Interviewing', 'Offer', 'Rejected', 'No Response'].map(
          s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as any)}
              className={`block w-full text-left px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-md ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          )
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 relative z-10">
        <header className="flex items-center justify-between bg-white/70 backdrop-blur-lg px-8 py-4 mb-6 rounded-full shadow-lg border-4 border-white border-opacity-60">
          <div className="flex-1 flex items-center space-x-4">
            <input
              type="text"
              placeholder="🔍 Search by company name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 p-3 rounded-full border-2 border-gray-300 focus:ring-4 focus:ring-sky-400 focus:border-sky-500 outline-none transition-all duration-200 ease-in-out text-lg font-comfortaa placeholder-gray-400"
            />
            <button
              onClick={() => setSortAsc(p => !p)}
              className="flex items-center space-x-2 px-6 py-3 border-2 rounded-full bg-white text-gray-700 font-bold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
            >
              <BiSort size={20} />
              <span>Sort {sortAsc ? 'A→Z' : 'Z→A'}</span>
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="ml-4 px-6 py-3 bg-green-400 text-white rounded-full font-bold hover:bg-green-600 transition-all duration-300 shadow-md"
          >
            + New Application
          </button>
          <button className="ml-4 p-3 rounded-full bg-white text-gray-700 hover:bg-gray-100 transition-all duration-300">
            <FiSettings size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          {error ? (
            <p className="text-red-500 text-center">
              Failed to load applications.
            </p>
          ) : !apps ? (
            <p className="text-center">Loading…</p>
          ) : visible.length === 0 ? (
            <p className="text-gray-200 text-center text-xl font-bold mt-12">
              No applications found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map(app => (
                <div
                  key={app._id}
                  className="bg-white/70 backdrop-blur-lg p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-4 border-white border-opacity-60"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        STATUS_STYLES[app.applicationStatus].color
                      } text-white shadow-md`}
                    >
                      {STATUS_STYLES[app.applicationStatus].icon}
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-800 font-bubblegum">
                      {app.companyName}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-1">
                    <strong>Role:</strong>{' '}
                    <span className="font-semibold">
                      {app.positionTitle || '-'}
                    </span>
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Location:</strong>{' '}
                    <span className="font-semibold">{app.location}</span>
                  </p>
                  <p className="text-gray-600">
                    <strong>Applied:</strong>{' '}
                    <span className="font-semibold">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="mt-4 text-center font-extrabold text-white text-sm rounded-full py-1 shadow-md bg-gradient-to-r from-teal-400 to-cyan-500 transition-all duration-300 ease-in-out">
                    {STATUS_STYLES[app.applicationStatus].text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAdd}
            className="bg-white/50 backdrop-blur-md p-10 rounded-[2rem] shadow-2xl space-y-6 w-full max-w-lg relative z-50"
          >
            <h2 className="text-2xl font-extrabold text-purple-800 font-bubblegum text-center">
              Add New Application
            </h2>
            <input
              className="w-full p-4 border-4 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 outline-none transition-all duration-200 ease-in-out text-lg font-comfortaa placeholder-gray-400"
              placeholder="Company Name"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
            <input
              className="w-full p-4 border-4 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 outline-none transition-all duration-200 ease-in-out text-lg font-comfortaa placeholder-gray-400"
              placeholder="Position Title"
              value={positionTitle}
              onChange={e => setPositionTitle(e.target.value)}
            />
            <input
              className="w-full p-4 border-4 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 outline-none transition-all duration-200 ease-in-out text-lg font-comfortaa placeholder-gray-400"
              placeholder="Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
            <input
              type="date"
              className="w-full p-4 border-4 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 outline-none transition-all duration-200 ease-in-out text-lg font-comfortaa placeholder-gray-400"
              value={applicationDate}
              onChange={e => setApplicationDate(e.target.value)}
              required
            />
            <select
              className="w-full p-4 border-4 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 outline-none transition-all duration-200 ease-in-out text-lg font-comfortaa"
              value={applicationStatus}
              onChange={e =>
                setApplicationStatus(
                  e.target.value as IInternshipApplication['applicationStatus']
                )
              }
            >
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="No Response">No Response</option>
            </select>
            <input
              className="w-full p-4 border-4 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 outline-none transition-all duration-200 ease-in-out text-lg font-comfortaa placeholder-gray-400"
              placeholder="Company Website"
              value={companyWebsite}
              onChange={e => setCompanyWebsite(e.target.value)}
            />
            <textarea
              className="w-full p-4 border-4 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 outline-none transition-all duration-200 ease-in-out text-lg font-comfortaa placeholder-gray-400"
              placeholder="Notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-gray-200 rounded-full font-bold hover:bg-gray-300 transition-colors duration-200 transform hover:scale-105 active:scale-95 shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-white font-extrabold text-lg bg-gradient-to-r from-pink-400 to-purple-600 hover:from-pink-500 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-rose-300 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}