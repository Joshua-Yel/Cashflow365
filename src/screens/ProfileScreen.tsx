import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../navigation/BottomNav";

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl text-gray-600 hover:text-gray-800"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">Profile</h1>
        <div></div>
      </div>

      <div className="p-4">
        <div className="card text-center">
          <h2 className="text-xl font-bold mb-4">Profile Screen</h2>
          <p className="text-gray-600 mb-4">
            This screen will manage user profile and settings including:
          </p>
          <ul className="text-left text-gray-600 space-y-2">
            <li>• Personal information management</li>
            <li>• Account settings and preferences</li>
            <li>• Notification preferences</li>
            <li>• Data export and backup options</li>
            <li>• Account security settings</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
