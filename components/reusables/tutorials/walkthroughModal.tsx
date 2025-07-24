import React, { FC } from 'react';
import Joyride, { Step } from 'react-joyride'; // Import Joyride

interface PropertySearchModalProps {
  isOpen: boolean; // To control the modal's visibility
  onClose: () => void; // Function to close the modal
  videoUrl: string; // URL for the embedded video
  title: string; // Title of the modal
  subtitle: string; // Subtitle for additional context
  termsUrl?: string; // Optional link to the Terms of Use
  steps: Step[]; // Steps for the tour (Joyride uses Step[] type)
  isTourOpen: boolean; // Control if the tour is open or not
  onStartTour: () => void; // Function to start the tour
  onCloseTour: () => void; // Function to close the tour
}

const PropertySearchModal: FC<PropertySearchModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  subtitle,
  termsUrl, // Optional terms URL
  steps, // Tour steps array passed as prop
  isTourOpen, // Tour visibility state
  onStartTour, // Function to start the tour
  onCloseTour // Function to close the tour
}) => {
  if (!isOpen) return null; // Do not render the modal if isOpen is false

  // Function to close the modal when clicking outside
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleOutsideClick} // Close the modal when clicking outside
      >
        <div className="relative w-96 rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
          {/* X Button for closing the modal */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            &#x2715; {/* This is the "X" character */}
          </button>

          {/* Video Section */}
          <div className="mb-4">
            <iframe
              width="100%"
              height="200"
              src={videoUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Title */}
          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="mb-4 text-gray-600 dark:text-gray-300">{subtitle}</p>

          {/* "Got it" Button */}
          <button
            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
            onClick={onClose}
          >
            Got it
          </button>

          {/* Conditionally render the Terms of Use clause */}
          {termsUrl && (
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-400">
              The use of the Lead ignite Property Search is subject to our{' '}
              <a
                href={termsUrl}
                className="text-blue-500 underline dark:text-blue-400"
              >
                Terms of Use
              </a>
              .
            </p>
          )}

          {/* Help Button for starting the tour */}
          <button
            className="mt-4 text-sm text-gray-700 hover:underline dark:text-gray-300"
            onClick={onStartTour} // Trigger the tour when clicked
          >
            Still need help? Get a tour
          </button>
        </div>
      </div>

      {/* Joyride Tour Component */}
      <Joyride
        steps={steps} // The steps for the guided tour
        run={isTourOpen} // Control if the tour is running
        continuous={true} // Set true if you want the user to continue through steps automatically
        scrollToFirstStep // Scroll to the first step
        showProgress // Show progress bar
        showSkipButton // Allow skipping the tour
        callback={(data) => {
          const { status } = data;
          if (status === 'finished' || status === 'skipped') {
            onCloseTour(); // Close the tour after completion
          }
        }}
      />
    </>
  );
};

export default PropertySearchModal;
