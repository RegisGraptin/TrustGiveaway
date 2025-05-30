export const ContestCard = ({ contest, isParticipated }) => {
  const today = new Date();
  const endDate = new Date(contest.endDate);
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      <div className="flex flex-col md:flex-row">
        {/* Left Side - Contest Info */}
        <div className="md:w-3/4 p-6 border-r border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contest.ended
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {contest.ended ? "Completed" : "Active"}
                </span>
                {!contest.ended && (
                  <span className="ml-2 flex items-center text-xs text-gray-500">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    Ends in {daysLeft} days
                  </span>
                )}
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg px-3 py-1 flex items-center">
              <UsersIcon className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-sm font-medium text-gray-800">
                {contest.participants} participants
              </span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-4 border border-blue-100">
              "{contest.tweetText}"
            </p>
          </div>

          <div className="mt-5 flex items-center">
            <div className="flex items-center text-sm text-gray-600">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                  <TwitterIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Creator</p>
                <p className="text-gray-600">@contest_creator</p>
              </div>
            </div>

            <div className="ml-6">
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="ml-1">
                  <span className="font-medium text-gray-900">4.8</span>
                  <span className="text-gray-600"> (128 reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {!contest.ended && (
            <div className="px-2 pt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Contest Progress</span>
                <span>{Math.min(100, Math.floor((daysLeft / 30) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.floor((daysLeft / 30) * 100)
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Actions & Status */}
        <div className="md:w-1/4 bg-gray-50 p-6">
          {contest.ended ? (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Winner Selected
                </h4>
                {contest.winner ? (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">W</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {contest.winner}
                      </p>
                      <p className="text-xs text-gray-600">
                        Grand Prize Winner
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No winner selected</p>
                )}
              </div>

              <div className="mt-auto">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                  View Results
                  <svg
                    className="ml-2 -mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-5">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Prize Pool
                </h4>
                <p className="text-2xl font-bold text-gray-900">1.5 ETH</p>
                <p className="text-sm text-gray-600">≈ $2,850 USD</p>
              </div>

              <div className="mt-auto space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
                  <TwitterIcon className="h-4 w-4 mr-2" />
                  Participate Now
                </button>

                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  View Details
                  <svg
                    className="ml-2 -mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Icons
const TwitterIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
    {...props}
  >
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const CalendarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="w-4 h-4"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const UsersIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="w-4 h-4"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);
