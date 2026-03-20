"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { TopBar } from "@/components/layout/TopBar";

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    contact_email: "",
  });

  useEffect(() => {
    if (publicKey) fetchProfile();
  }, [publicKey]);

  const fetchProfile = async () => {
    if (!publicKey) return;
    try {
      const res = await fetch(`/api/users/profile?wallet=${publicKey.toBase58()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setFormData({
            full_name: data.profile.full_name || "",
            username: data.profile.username || "",
            bio: data.profile.bio || "",
            contact_email: data.profile.contact_email || "",
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }
      setMessage("Profile saved successfully.");
    } catch (e: any) {
      setMessage(e.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TopBar title="My Profile" description="Manage your public Web3 B2B Identity" />

      <div className="p-6 max-w-2xl">
        <div className="card bg-white mt-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
          
          {loading ? (
            <div className="text-sm text-gray-500">Loading your profile...</div>
          ) : (
            <div className="space-y-5 text-left">
              <div>
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="John Doe" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Username (Optional)</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="@johndoe" 
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Professional Bio</label>
                <textarea 
                  className="input min-h-[100px]" 
                  placeholder="Briefly describe your firm or auditing experience..." 
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div>
                <label className="input-label">Contact Email</label>
                <input 
                  type="email" 
                  className="input" 
                  placeholder="john@example.com" 
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>

              <div className="pt-4">
                <button 
                  className="btn-primary w-full" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving changes..." : "Save Profile"}
                </button>
              </div>

              {message && (
                <div className={`mt-2 p-3 text-sm rounded ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
