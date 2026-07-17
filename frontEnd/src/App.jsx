import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { regionOptions } from "./data/options";
import UserProfileModal from "./components/UserProfileModal";

const BASE_URL = import.meta.env.VITE_API_URL || "";
const API_BASE_URL = `${BASE_URL}/api/recommend-crop`;

const defaultFormState = {
  state: "Andhra Pradesh",
  district: "West Godavari",
  farmAddress: "",
  latitude: null,
  longitude: null,
};

function App() {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem("seed2success_token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("seed2success_user")); } catch { return null; }
  });

  function handleLogin(newToken, newUser) {
    localStorage.setItem("seed2success_token", newToken);
    localStorage.setItem("seed2success_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  async function handleUpdateProfile(name, email, state, district) {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/auth/profile`,
        { name, email, state, district },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem("seed2success_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Update formState with the new default state and district
        setFormState((prev) => ({
          ...prev,
          state: updatedUser.state || prev.state,
          district: updatedUser.district || prev.district,
        }));

        if (updatedUser.state && updatedUser.district) {
          fetchRecommendations({ state: updatedUser.state, district: updatedUser.district });
        }
        
        return { success: true };
      }
      return { success: false, error: "Failed to update profile." };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Error updating profile details.",
      };
    }
  }

  // Synchronize formState with user location when user object changes (e.g. login or profile update)
  useEffect(() => {
    if (user && user.state && user.district) {
      setFormState((prev) => ({
        ...prev,
        state: user.state,
        district: user.district,
      }));
    }
  }, [user]);

  function handleLogout() {
    localStorage.removeItem("seed2success_token");
    localStorage.removeItem("seed2success_user");
    setToken(null);
    setUser(null);
  }

  const [formState, setFormState] = useState(defaultFormState);
  const [districts, setDistricts] = useState(regionOptions);
  const [locating, setLocating] = useState(false);
  const hasAutoLocated = useRef(false);

  // Phase 1 State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function fetchRecommendations(locationParams) {
    const { latitude, longitude, state, district } = locationParams;
    const hasCoords = typeof latitude === "number" && typeof longitude === "number";
    const hasRegion = state && district;

    if (!hasCoords && !hasRegion) {
      setErrorMessage("Please select a location or detect your location first.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setResult(null);

    try {
      const payload = hasCoords ? { latitude, longitude } : { state, district };
      const response = await axios.post(`${BASE_URL}/api/recommend-crop/from-location`, payload);
      const data = response.data;
      setResult(data);

      const updatedForm = {
        ...formState,
        latitude: data.farmer_profile.latitude,
        longitude: data.farmer_profile.longitude,
        state: data.farmer_profile.state,
        district: data.farmer_profile.district,
        farmAddress: data.farmer_profile.farmAddress || `${data.farmer_profile.district}, ${data.farmer_profile.state}, ${data.farmer_profile.country}`
      };
      setFormState(updatedForm);

      // Add to session history
      const session = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        state: data.farmer_profile.state,
        district: data.farmer_profile.district,
        topCrop: data.top_crops?.[0]?.crop || "N/A",
        score: data.top_crops?.[0]?.suitability_score || 0,
        result: data,
        formState: updatedForm,
      };
      setSessions((prev) => [session, ...prev]);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || "Unable to retrieve recommendation. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function requestLocationAccess(force = false) {
    if (!navigator.geolocation) {
      setErrorMessage("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocating(false);
        await fetchRecommendations({ latitude, longitude });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocating(false);
        if (force) {
          setErrorMessage("Location access was denied or unavailable. Please select your state and district manually.");
        }
      }
    );
  }

  useEffect(() => {
    if (token && !hasAutoLocated.current) {
      hasAutoLocated.current = true;
      if (user && user.state && user.district) {
        fetchRecommendations({ state: user.state, district: user.district });
      } else {
        requestLocationAccess(false);
      }
    }
  }, [token]);

  // Phase 2 State
  const [phase2Loading, setPhase2Loading] = useState(false);
  const [phase2Error, setPhase2Error] = useState("");
  const [phase2Result, setPhase2Result] = useState(null);
  const [phase2Sessions, setPhase2Sessions] = useState([]);
  const [phase2SidebarOpen, setPhase2SidebarOpen] = useState(false);

  // Phase 3 State
  const [harvestLoading, setHarvestLoading] = useState(false);
  const [harvestError, setHarvestError] = useState("");
  const [harvestResult, setHarvestResult] = useState(null);
  const [harvestSessions, setHarvestSessions] = useState([]);
  const [harvestSidebarOpen, setHarvestSidebarOpen] = useState(false);

  // Phase 4 State
  const [sellingLoading, setSellingLoading] = useState(false);
  const [sellingError, setSellingError] = useState("");
  const [sellingResult, setSellingResult] = useState(null);
  const [sellingSessions, setSellingSessions] = useState([]);
  const [sellingSidebarOpen, setSellingSidebarOpen] = useState(false);

  // Phase 5 State
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionSidebarOpen, setPredictionSidebarOpen] = useState(false);

  function updateField(field, value) {
    setFormState((current) => {
      if (field === "locationSelection") {
        return {
          ...current,
          farmAddress: value.address || current.farmAddress,
          latitude: typeof value.latitude === "number" ? value.latitude : current.latitude,
          longitude: typeof value.longitude === "number" ? value.longitude : current.longitude,
          state: value.state || current.state,
          district: value.state && value.district ? value.district : value.state ? (districts[value.state] || [])[0] || current.district : value.district || current.district,
        };
      }
      if (field === "state") {
        return { ...current, state: value, district: (districts[value] || [])[0] || "" };
      }
      return { ...current, [field]: value };
    });
  }

  function handleSelectSession(session) {
    setResult(session.result);
    setFormState(session.formState);
    setSidebarOpen(false);
  }

  async function handlePhase2Submit(data) {
    setPhase2Loading(true);
    setPhase2Error("");
    setPhase2Result(null);

    try {
      const formData = new FormData();
      if (data.files.report) formData.append("report", data.files.report);
      Object.keys(data.files.photos || {}).forEach(k => formData.append(`photo_${k}`, data.files.photos[k]));
      formData.append("answers", JSON.stringify(data.answers));

      const selectedImage = data.files.photos?.leaf || data.files.photos?.field || Object.values(data.files.photos || {}).find(Boolean);
      let diseaseResponse = null;

      if (selectedImage) {
        const diseaseFormData = new FormData();
        diseaseFormData.append("image", selectedImage);
        try {
          diseaseResponse = await axios.post(`${BASE_URL}/api/detect-disease`, diseaseFormData);
        } catch (_error) {
          diseaseResponse = {
            data: {
              plant: "Unavailable",
              health_status: "Unavailable",
              disease_name: null,
              confidence: 0,
              vision_labels: [],
              treatment: _error.response?.data?.error || "Image disease detection is unavailable until the backend API keys are configured.",
              warning: "Gemini API is not configured or returned an error on the backend.",
            },
          };
        }
      }

      const mergedResult = {
        success: true,
        diseaseDetection: diseaseResponse?.data || null,
      };
      setPhase2Result(mergedResult);

      const session = {
        id: Date.now(),
        date: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        stage: data.answers.stage || "Analysis",
        result: mergedResult
      };
      setPhase2Sessions(prev => [session, ...prev]);
    } catch (error) {
      setPhase2Error(error.response?.data?.error || "Unable to analyze crop health. Please check your connection.");
    } finally {
      setPhase2Loading(false);
    }
  }

  function handleSelectPhase2Session(session) {
    setPhase2Result(session.result);
    setPhase2SidebarOpen(false);
  }

  async function handleHarvestSubmit(data) {
    setHarvestLoading(true);
    setHarvestError("");
    setHarvestResult(null);

    try {
      const response = await axios.post(`${BASE_URL}/api/harvest/analyze`, {
        answers: data.answers
      });
      setHarvestResult(response.data);

      const session = {
        id: Date.now(),
        date: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        stage: response.data.summary?.maturityStage || response.data.cards?.harvestReadiness?.verdict || "Harvest analysis",
        result: response.data,
      };
      setHarvestSessions((prev) => [session, ...prev]);
    } catch (error) {
      setHarvestError(error.response?.data?.error || "Unable to analyze harvest readiness. Please check your connection.");
    } finally {
      setHarvestLoading(false);
    }
  }

  function handleSelectHarvestSession(session) {
    setHarvestResult(session.result);
    setHarvestSidebarOpen(false);
  }

  async function handleSellingSubmit(data) {
    setSellingLoading(true);
    setSellingError("");
    setSellingResult(null);

    try {
      const formData = new FormData();
      Object.keys(data.files.photos || {}).forEach((key) => formData.append(`photo_${key}`, data.files.photos[key]));
      
      const answersWithLocation = {
        ...data.answers,
        state: formState.state,
        district: formState.district
      };
      formData.append("answers", JSON.stringify(answersWithLocation));

      const response = await axios.post(`${BASE_URL}/api/selling/analyze`, formData);
      setSellingResult(response.data);

      const session = {
        id: Date.now(),
        date: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        crop: response.data.summary?.cropType || "Selling analysis",
        readiness: response.data.cards?.saleReadiness?.rating || "Review",
        result: response.data,
      };
      setSellingSessions((prev) => [session, ...prev]);
    } catch (error) {
      setSellingError(error.response?.data?.error || "Unable to analyze selling conditions. Please check your connection.");
    } finally {
      setSellingLoading(false);
    }
  }

  function handleSelectSellingSession(session) {
    setSellingResult(session.result);
    setSellingSidebarOpen(false);
  }

  async function handleRunPrediction(params) {
    if (!params) {
      setPrediction(null);
      return;
    }
    setPredictionLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/crop-prediction`, params);
      setPrediction(response.data);
    } catch (error) {
      console.error("Prediction failed", error);
    } finally {
      setPredictionLoading(false);
    }
  }

  const propsObject = {
    planning: {
      formState, districts, onFieldChange: updateField, loading, errorMessage, result,
      sessions, onSelectSession: handleSelectSession,
      sidebarOpen, onToggleSidebar: () => setSidebarOpen(!sidebarOpen),
      requestLocationAccess, locating, user, onLogout: handleLogout,
      onGenerateRecommendations: fetchRecommendations
    },
    health: {
      sessions: phase2Sessions, onSelectSession: handleSelectPhase2Session, sidebarOpen: phase2SidebarOpen,
      onToggleSidebar: () => setPhase2SidebarOpen(!phase2SidebarOpen), onSubmit: handlePhase2Submit,
      loading: phase2Loading, errorMessage: phase2Error, result: phase2Result
    },
    harvesting: {
      sessions: harvestSessions, onSelectSession: handleSelectHarvestSession, sidebarOpen: harvestSidebarOpen,
      onToggleSidebar: () => setHarvestSidebarOpen(!harvestSidebarOpen), onSubmit: handleHarvestSubmit,
      loading: harvestLoading, errorMessage: harvestError, result: harvestResult
    },
    selling: {
      sessions: sellingSessions, onSelectSession: handleSelectSellingSession, sidebarOpen: sellingSidebarOpen,
      onToggleSidebar: () => setSellingSidebarOpen(!sellingSidebarOpen), onSubmit: handleSellingSubmit,
      loading: sellingLoading, errorMessage: sellingError, result: sellingResult
    },
    schemes: {},
    subscription: {
      sidebarOpen: sellingSidebarOpen, onToggleSidebar: () => setSellingSidebarOpen(!sellingSidebarOpen)
    },
    prediction: {
      sidebarOpen: predictionSidebarOpen, onToggleSidebar: () => setPredictionSidebarOpen(!predictionSidebarOpen),
      prediction, loading: predictionLoading, onRunPrediction: handleRunPrediction
    }
  };

  return (
    <BrowserRouter>
      <AppRoutes 
        token={token} 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        onEditProfile={() => setIsProfileOpen(true)}
        props={propsObject} 
      />
      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
        districts={districts} 
        onUpdateProfile={handleUpdateProfile} 
      />
    </BrowserRouter>
  );
}

export default App;
