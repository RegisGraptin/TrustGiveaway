"use client";

import { useState } from "react";
import Head from "next/head";
import CreateContest from "./workflow/CreateContest";

export default function Contest() {
  const [contests, setContests] = useState([]);
  const [newContest, setNewContest] = useState({
    title: "",
    description: "",
    tweetText: "",
    endDate: "",
  });
  const [activeTab, setActiveTab] = useState("create");

  const handleEndContest = (contestId) => {
    setContests(
      contests.map((contest) => {
        if (contest.id === contestId) {
          const winnerIndex = Math.floor(
            Math.random() * contest.participants.length
          );
          return {
            ...contest,
            ended: true,
            winner: contest.participants[winnerIndex] || null,
          };
        }
        return contest;
      })
    );
  };

  return (
    <div className="">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {["create", "contests", "active", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "create" && "Create Contest"}
                {tab === "contests" && "My Contests"}
                {tab === "active" && "Active Contests"}
                {tab === "completed" && "Completed"}
              </button>
            ))}
          </nav>
        </div>

        {/* Create Contest Form */}
        {activeTab === "create" && <CreateContest />}

        {/* Contest Listings */}
        {(activeTab === "contests" ||
          activeTab === "active" ||
          activeTab === "completed") && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {activeTab === "contests" && "My Contests"}
              {activeTab === "active" && "Active Contests"}
              {activeTab === "completed" && "Completed Contests"}
            </h2>

            {contests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No contests yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first contest to get started
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Contest
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {contests.map((contest) => (
                  <ContestCard
                    key={contest.id}
                    contest={contest}
                    onEndContest={handleEndContest}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Contest Card Component
const ContestCard = ({ contest, onEndContest }) => {
  const isOwner = true; // Replace with actual owner check from wallet

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {contest.title}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              contest.ended
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {contest.ended ? "Completed" : "Active"}
          </span>
        </div>

        <p className="mt-2 text-gray-500 text-sm line-clamp-2">
          {contest.description || "No description provided"}
        </p>

        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Participants</span>
            <span className="font-medium">{contest.participants.length}</span>
          </div>

          <div className="mt-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Contest Tweet
            </h4>
            <div className="mt-1 bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">{contest.tweetText}</p>
            </div>
          </div>

          {contest.ended ? (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Winner
              </h4>
              {contest.winner ? (
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <TwitterIcon className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      @{contest.winner}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No participants</p>
              )}
            </div>
          ) : (
            isOwner && (
              <div className="mt-4">
                <button
                  onClick={() => onEndContest(contest.id)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  End Contest & Pick Winner
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// Twitter Icon Component
const TwitterIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);
