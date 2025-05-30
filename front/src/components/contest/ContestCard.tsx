export const ContestCard = ({ contest, isParticipated }) => {
  const today = new Date();
  const endDate = new Date(contest.endDate);
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900">{contest.title}</h3>
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

        <p className="mt-3 text-gray-600 text-sm">{contest.tweetText}</p>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">
                {contest.participants} participants
              </span>
            </div>

            {!contest.ended && (
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">{daysLeft}d left</span>
              </div>
            )}
          </div>

          {contest.ended ? (
            <div className="mt-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Winner
              </h4>
              {contest.winner ? (
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    {/* <TwitterIcon className="h-4 w-4 text-blue-400" /> */}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {contest.winner}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No winner selected</p>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                View Details
              </button>
              {!isParticipated && (
                <button className="flex-1 bg-gray-800 hover:bg-black text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                  {/* <TwitterIcon className="h-4 w-4 mr-1" /> */}
                  Participate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UsersIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
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

const CalendarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
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
