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
   const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [visitorType, setVisitorType] = useState('Individual');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState('');
  const [contact_number, setContact_number] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
    const [formData, setFormData] = useState({
      name: "",
      visitorType: "Individual",
      email: "",
      address: "",
      contact_number: "",
      photo: "",
    });

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
       console.log("Page loaded successfully!");
    } catch (error) {
      console.error("Failed to load dashboard data.");
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
      console.error("Failed to load recent activities.");
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
      console.error("Failed to load today's guests.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      setSelectedImage(URL.createObjectURL(file));
    }
  };

const handleAddGuest = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name || name);
    formDataToSend.append("visitorType", formData.visitorType || visitorType);
    formDataToSend.append("email", formData.email || email);
    formDataToSend.append("address", formData.address || address);
    formDataToSend.append(
      "contact_number",
      formData.contact_number || contact_number
    );
    if (formData.photo) {
      formDataToSend.append("photo", formData.photo);
    }

    await api.post("/staff/guests/add", formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success(
      "New visitor added successfully and a mail has been sent to the visitor."
    );
    setShowAddGuest(false);
    setName("");
    setVisitorType("Individual");
    setEmail("");
    setAddress("");
    setContact_number("");
    setSelectedImage(null);
    fetchDashboardData();
  } catch (error) {
    toast.error("Failed to add new visitor.");
  } finally {
    setIsSubmitting(false);
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
        photo={photo}
        handleImageChange={handleImageChange}
        selectedImage={selectedImage}
        contact_number={contact_number}
        visitorType={visitorType}
        email={email}
        address={address}
        setName={setName}
        isSubmitting={isSubmitting}
        setVisitorType={setVisitorType}
        setEmail={setEmail}
        setAddress={setAddress}
        setContact_number={setContact_number}
        handleAddGuest={handleAddGuest}
      />
    </div>
  );
}
