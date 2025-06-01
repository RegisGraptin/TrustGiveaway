"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateContest from "@/components/workflow/CreateContest";
import { ParticipatedContest } from "./workflow/ParticipatedContest";
import { MyContest } from "./workflow/MyContest";
import { AllContest } from "./workflow/AllContest";
import TwitterVerification from "./workflow/TwitterCheck";
import { ProofProvider } from "@vlayer/react";

export default function Contest() {
  const [activeTab, setActiveTab] = useState("all-contests");

  return (
    <>
      {/* Tab Navigation */}
      <div className="mb-8 flex justify-center">
        <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
          {[
            { id: "all-contests", label: "All Contests" },
            // { id: "participated", label: "Participated" },
            { id: "create", label: "Create Contest" },
            { id: "account", label: "Twitter Account" },
            // { id: "my-contests", label: "My Contests" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  className="absolute inset-0 bg-blue-50 rounded-lg z-0"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {activeTab === "all-contests" && <AllContest />}

            {/* {activeTab === "participated" && <ParticipatedContest />} */}

            {activeTab === "create" && <CreateContest />}

            {activeTab === "account" && (
              <ProofProvider
                config={{
                  proverUrl: process.env.NEXT_PUBLIC_PROVER_URL,
                  wsProxyUrl: process.env.NEXT_PUBLIC_WS_PROXY_URL,
                  notaryUrl: process.env.NEXT_PUBLIC_NOTARY_URL,
                  token: process.env.NEXT_PUBLIC_VLAYER_API_TOKEN,
                }}
              >
                <TwitterVerification />
              </ProofProvider>
            )}

            {/* {activeTab === "my-contests" && <MyContest />} */}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
