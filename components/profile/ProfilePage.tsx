"use client";
import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot, updateDoc, collection, query, where, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  Grid3X3,
  Settings,
  LogOut,
  Timer,
  Users,
  MessageSquareQuote,
  Camera,
  Edit3,
  X,
  Check,
  User as UserIcon,
  Sparkles,
  Trash2,
  Plus,
  ShieldAlert,
} from "lucide-react";

interface ProfilePageProps {
  onSignOut?: () => void;
}

interface UserData {
  username: string;
  phone?: string;
  zipCode?: string;
  dob?: string;
  language?: string;
  gender?: string;
  race?: string;
  role?: string;
  bio?: string;
  photoURL?: string;
  walletMinutes?: number;
  partiesJoined?: number;
  createdAt?: { seconds: number };
}

function getAge(dob: string): number {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function ProfilePage({ onSignOut, onOpenAdmin }: ProfilePageProps & { onOpenAdmin?: () => void }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editZipCode, setEditZipCode] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editRace, setEditRace] = useState("");
  const [editPhotoURL, setEditPhotoURL] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // My Lies state & modal
  const [showMyLies, setShowMyLies] = useState(false);
  const [myLies, setMyLies] = useState<Array<{ id: string; text: string; tag: string; n: number }>>([]);
  const [newLieInput, setNewLieInput] = useState("");
  const [newLieTag, setNewLieTag] = useState("Social");
  const [postingLie, setPostingLie] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    // Real-time listener — updates user info
    const unsubUser = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserData;
        setUser(data);
      }
      setLoading(false);
    });

    // Real-time listener — updates user's lies list
    const liesQuery = query(collection(db, "lies"), where("authorId", "==", uid));
    const unsubLies = onSnapshot(liesQuery, (snap) => {
      const fetched = snap.docs.map((d) => ({
        id: d.id,
        text: d.data().text ?? "",
        tag: d.data().tag ?? "Social",
        n: d.data().n ?? 0,
      }));
      setMyLies(fetched);
    });

    return () => {
      unsubUser();
      unsubLies();
    };
  }, []);

  const openEditModal = () => {
    if (!user) return;
    setEditUsername(user.username || "");
    setEditBio(user.bio || "");
    setEditZipCode(user.zipCode || "");
    setEditLanguage(user.language || "English");
    setEditGender(user.gender || "Male");
    setEditRace(user.race || "Prefer not to say");
    setEditPhotoURL(user.photoURL || "");
    setIsEditing(true);
  };

  const handleCreateLieFromProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !newLieInput.trim()) return;

    setPostingLie(true);
    try {
      await addDoc(collection(db, "lies"), {
        text: newLieInput.trim(),
        tag: newLieTag,
        n: 0,
        authorId: uid,
        createdAt: serverTimestamp(),
      });
      setNewLieInput("");
      setToastMsg("Lie posted successfully!");
      setTimeout(() => setToastMsg(""), 3000);
    } catch (e) {
      console.error("Failed to post lie:", e);
    } finally {
      setPostingLie(false);
    }
  };

  const handleDeleteLie = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lie?")) return;
    try {
      await deleteDoc(doc(db, "lies", id));
      setToastMsg("Lie deleted.");
      setTimeout(() => setToastMsg(""), 3000);
    } catch (e) {
      console.error("Error deleting lie:", e);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 350;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        setEditPhotoURL(base64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", uid), {
        username: editUsername.trim(),
        bio: editBio.trim(),
        zipCode: editZipCode.trim(),
        language: editLanguage,
        gender: editGender,
        race: editRace,
        photoURL: editPhotoURL,
      });

      setIsEditing(false);
      setToastMsg("Profile updated successfully!");
      setTimeout(() => setToastMsg(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const initial = user?.username?.[0]?.toUpperCase() ?? "?";
  const age = user?.dob ? getAge(user.dob) : null;

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "3px solid rgba(124,58,237,0.3)",
            borderTop: "3px solid #7c3aed",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 scroll relative">
      {/* ── Toast Notification ──────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass px-4 py-2 rounded-full text-xs font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-2 shadow-xl animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMsg}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight">Profile</h2>
        <button
          onClick={openEditModal}
          className="w-10 h-10 rounded-full glass grid place-items-center hover:scale-105 transition-transform"
          aria-label="Settings & Edit"
        >
          <Settings className="w-5 h-5 text-white/80" />
        </button>
      </div>

      {/* ── Avatar + Name + Bio ──────────────────────────────────── */}
      <div className="flex flex-col items-center pt-3 pb-5 px-5 text-center">
        <div className="relative group">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-500/50 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full grad grid place-items-center text-4xl font-extrabold text-white shadow-lg">
              {initial}
            </div>
          )}

          {/* Quick upload trigger on avatar */}
          <button
            onClick={openEditModal}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-600 text-white grid place-items-center shadow-md hover:bg-purple-500 transition-colors border border-black/40"
            title="Edit Photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-2xl font-extrabold mt-3 flex items-center gap-1.5 justify-center">
          {user?.username ?? "—"}
          {age ? `, ${age}` : ""}
        </h3>

        <p className="text-sm mt-1" style={{ color: "var(--mute)" }}>
          📍 {user?.zipCode ?? "—"} · {user?.language ?? "—"} · {user?.gender ?? "—"}
        </p>

        {/* Bio Section */}
        {user?.bio ? (
          <div className="mt-3 px-4 py-2 rounded-2xl glass border border-white/10 max-w-sm text-sm text-white/90 italic flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>"{user.bio}"</span>
          </div>
        ) : (
          <button
            onClick={openEditModal}
            className="mt-3 text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" /> + Add Bio
          </button>
        )}

        {/* Edit Profile Button */}
        <button
          onClick={openEditModal}
          className="mt-4 px-5 py-2 rounded-full glass border border-purple-500/40 text-xs font-bold flex items-center gap-2 hover:bg-purple-500/20 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5 text-purple-400" />
          Edit Profile
        </button>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 px-5 mb-6">
        {[
          { label: "Parties", value: user?.partiesJoined ?? 0, Icon: Users },
          { label: "Wallet", value: `${user?.walletMinutes ?? 0}m`, Icon: Timer },
          { label: "Lies", value: myLies.length, Icon: MessageSquareQuote },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="glass rounded-2xl p-3 text-center">
            <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: "var(--purple)" }} />
            <p className="text-xl font-extrabold gtxt">{value}</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--mute)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Account Info Card ────────────────────────────────────── */}
      <div className="glass rounded-3xl mx-5 p-4 mb-4 space-y-2.5">
        <div className="flex justify-between items-center mb-1">
          <p className="font-bold text-sm">Account Info</p>
          <button
            onClick={openEditModal}
            className="text-xs text-purple-400 hover:underline font-medium"
          >
            Edit
          </button>
        </div>
        {[
          { label: "Phone", value: user?.phone ?? "—" },
          { label: "Zip Code", value: user?.zipCode ?? "—" },
          { label: "Language", value: user?.language ?? "—" },
          { label: "Gender", value: user?.gender ?? "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span style={{ color: "var(--mute)" }}>{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>

      {/* ── Actions ──────────────────────────────────────────────── */}
      <div className="mx-5 space-y-3 pb-6">
        <button
          onClick={() => setShowMyLies(true)}
          className="glass w-full rounded-2xl p-4 flex items-center justify-between font-bold text-left hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <Grid3X3 className="w-5 h-5 text-amber-500" />
            My Lies
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-extrabold">
            {myLies.length}
          </span>
        </button>

        {/* Admin Dashboard Trigger */}
        <button
          onClick={onOpenAdmin}
          className="glass w-full rounded-2xl p-4 flex items-center justify-between font-bold text-left border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-all"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            Admin Control Center
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase">
            👑 Admin
          </span>
        </button>

        <button
          onClick={onSignOut}
          className="glass w-full rounded-2xl p-4 flex items-center gap-3 font-bold text-rose-500 text-left"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* ── EDIT PROFILE MODAL ────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#12111a] border border-white/10 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-purple-400" />
                Edit Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full glass grid place-items-center"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-sm">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {editPhotoURL ? (
                    <img
                      src={editPhotoURL}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full grad grid place-items-center text-3xl font-extrabold text-white">
                      {initial}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-purple-600 text-white grid place-items-center shadow hover:bg-purple-500"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-purple-400 font-semibold hover:underline"
                  >
                    Change Photo
                  </button>
                  {editPhotoURL && (
                    <>
                      <span className="text-xs text-white/30">•</span>
                      <button
                        type="button"
                        onClick={() => setEditPhotoURL("")}
                        className="text-xs text-rose-400 font-semibold hover:underline"
                      >
                        Remove Photo
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter username"
                />
              </div>

              {/* Bio Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-white/70">
                    Bio
                  </label>
                  <span className="text-[10px] text-white/40">
                    {editBio.length}/120
                  </span>
                </div>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value.slice(0, 120))}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 resize-none text-xs"
                  placeholder="Tell others about yourself..."
                />
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={editZipCode}
                  onChange={(e) => setEditZipCode(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Zip Code"
                />
              </div>

              {/* Language Dropdown */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Language
                </label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 bg-[#191724]"
                >
                  <option value="English">English</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              {/* Gender Dropdown */}
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">
                  Gender
                </label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500 bg-[#191724]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-white/10 flex gap-3 bg-[#12111a]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-2xl glass font-bold text-white/70 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 py-3 rounded-2xl grad font-extrabold text-white text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MY LIES MODAL ────────────────────────────────────────── */}
      {showMyLies && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#12111a] border border-white/10 w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-amber-500" />
                My Posted Lies ({myLies.length})
              </h3>
              <button
                onClick={() => setShowMyLies(false)}
                className="w-8 h-8 rounded-full glass grid place-items-center"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-sm scroll">
              {/* Quick Post Lie section inside modal */}
              <div className="p-3 rounded-2xl glass border border-amber-500/20 space-y-2">
                <p className="text-xs font-bold text-amber-400">Post a New Lie</p>
                <input
                  type="text"
                  value={newLieInput}
                  onChange={(e) => setNewLieInput(e.target.value)}
                  placeholder="e.g. I only sleep 3 hours a day..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-amber-500"
                />
                <div className="flex justify-between items-center pt-1">
                  <div className="flex gap-1.5 overflow-x-auto">
                    {["Sleep", "Work", "Food", "Social"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewLieTag(t)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          newLieTag === t
                            ? "bg-amber-500 text-black border-amber-500"
                            : "border-white/10 text-white/50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateLieFromProfile}
                    disabled={postingLie || !newLieInput.trim()}
                    className="px-3 py-1.5 rounded-full bg-amber-500 font-extrabold text-black text-xs flex items-center gap-1 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" /> Post
                  </button>
                </div>
              </div>

              {/* List of user lies */}
              {myLies.length === 0 ? (
                <div className="text-center py-8 text-white/40 space-y-1">
                  <p className="font-bold">No lies posted yet 🤥</p>
                  <p className="text-xs">Post your first funny lie above or from the Lies tab!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myLies.map((lie) => (
                    <div
                      key={lie.id}
                      className="p-3.5 rounded-2xl glass border border-white/10 flex justify-between items-center gap-3"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-white/90">"{lie.text}"</p>
                        <div className="flex items-center gap-2 text-[10px] text-white/50">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
                            {lie.tag}
                          </span>
                          <span>❤️ {lie.n} likes</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLie(lie.id)}
                        className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 grid place-items-center shrink-0"
                        title="Delete Lie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/10 bg-[#12111a]">
              <button
                type="button"
                onClick={() => setShowMyLies(false)}
                className="w-full py-3 rounded-2xl glass font-bold text-white/70 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
