import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from "./staffDashboard/include/NavBar";
import MainDashboard from "./staffDashboard/include/components/MainDashboard";
import RecentActivitiesPage from "./staffDashboard/include/components/RecentActivitiesPage";
import TodaysGuestsPage from "./staffDashboard/include/components/TodaysGuestsPage";
import AddGuestModal from "./staffDashboard/include/components/AddGuestModal";
import { useAuth } from "../context/AuthContext";
import api from "../context/api";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({ total_visitors_today: 0, upcoming_visits: 0, pending_guests: 0 });
  const [recents, setRecents] = useState([]);
  const [todaysGuests, setTodaysGuests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAddGuest, setShowAddGuest] = useState(false);

  const [name, setName] = useState('');
  const [visitorType, setVisitorType] = useState('Individual');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [contact_number, setContact_number] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, recentsRes, todaysGuestsRes] = await Promise.all([
        api.get(`/staff/dashboard/summary`),
        api.get(`/staff/dashboard/recents`),
        api.get(`/staff/dashboard/todays-guests?per_page=3`),
      ]);
      setSummaryData(summaryRes.data);
      setRecents(recentsRes.data.recents.visits);
      setTodaysGuests(todaysGuestsRes.data.guests);
      setNotifications(recentsRes.data.recents.notifications.slice(0, 3));
    } catch (error) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFullRecents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/staff/dashboard/recents?per_page=20`);
      setRecents(response.data.recents.visits);
    } catch {
      toast.error("Failed to load recent activities.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFullTodaysGuests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/staff/dashboard/todays-guests?per_page=20`);
      setTodaysGuests(response.data.guests);
    } catch {
      toast.error("Failed to load today's guests.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff/guests/add', { name, visitorType, email, address,contact_number });
      toast.success("New visitor added successfully!");
      setShowAddGuest(false);
      setName(''); setVisitorType('Individual'); setEmail(''); setAddress(''); setContact_number('');
      fetchDashboardData();
    } catch {
      toast.error("Failed to add new visitor.");
    }
  };

  useEffect(() => {
    if (currentPage === 'dashboard') fetchDashboardData();
    else if (currentPage === 'recents') fetchFullRecents();
    else if (currentPage === 'todays-guests') fetchFullTodaysGuests();
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'recents':
        return <RecentActivitiesPage recents={recents} loading={loading} goBack={() => setCurrentPage('dashboard')} />;
      case 'todays-guests':
        return <TodaysGuestsPage todaysGuests={todaysGuests} loading={loading} goBack={() => setCurrentPage('dashboard')} />;
      default:
        return (
          <MainDashboard
            user={user}
            summaryData={summaryData}
            notifications={notifications}
            todaysGuests={todaysGuests}
            openAddGuestModal={() => setShowAddGuest(true)}
            goToRecents={() => setCurrentPage('recents')}
            goToGuests={() => setCurrentPage('todays-guests')}
          />
        );
    }
  };

  return (
    <div>
      <NavBar />
      <ToastContainer position="top-right" autoClose={5000} />
      {renderPage()}
      <AddGuestModal
        show={showAddGuest}
        onClose={() => setShowAddGuest(false)}
        name={name}
        visitorType={visitorType}
        email={email}
        address={address}
        setName={setName}
        setVisitorType={setVisitorType}
        setEmail={setEmail}
        setAddress={setAddress}
        setContact_number={setContact_number}
        handleAddGuest={handleAddGuest}
      />
    </div>
  );
}
