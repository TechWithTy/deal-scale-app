import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import VoiceCloningModal from './cloneModal';

interface VoiceSelectorProps {
  voices: AssistantVoice[]; // Array of AssistantVoice objects
  onVoiceSelect: (voiceId: string) => void; // Function to handle voice selection
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  onVoiceSelect
}) => {
  const [showCloningModal, setShowCloningModal] = useState(false);
  const [visibleVoices, setVisibleVoices] = useState<AssistantVoice[]>([]);
  const [loadCount, setLoadCount] = useState(5); // Number of items to load at a time

  // Lazy load voices - only show 5 at a time
  useEffect(() => {
    setVisibleVoices(voices.slice(0, loadCount));
  }, [voices, loadCount]);

  const handleVoiceSelect = (voiceId: string) => {
    if (voiceId === 'clone') {
      setShowCloningModal(true); // Open modal for cloning voice
    } else {
      onVoiceSelect(voiceId); // Normal voice selection
    }
  };

  const loadMoreVoices = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // Increase the number of visible voices by 5
    if (loadCount < voices.length) {
      setLoadCount((prevCount) => prevCount + 5);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Choose Your Voice
      </label>
      <Select onValueChange={handleVoiceSelect}>
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="Select a voice" />
        </SelectTrigger>
        <SelectContent className="z-50 mt-2 max-h-60 overflow-y-auto">
          {/* Special styling for the 'Clone Your Voice' option */}
          <SelectItem
            key="clone"
            value="clone"
            className="cursor-pointer font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-600"
          >
            Clone Your Voice
          </SelectItem>

          {/* Display only the visible voices */}
          {visibleVoices.map((voice) => (
            <SelectItem
              key={voice.voiceId}
              value={voice.voiceId}
              className="cursor-pointer"
            >
              {voice.provider.toUpperCase()} - {voice.voiceId}
            </SelectItem>
          ))}

          {/* Load More button to display more voices */}
          {loadCount < voices.length && (
            <div
              key="load-more"
              className="cursor-pointer py-2 text-center font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={loadMoreVoices} // Prevent selection, only load more voices
            >
              Load More Voices
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Render Voice Cloning Modal */}
      {showCloningModal && (
        <VoiceCloningModal onClose={() => setShowCloningModal(false)} />
      )}
    </div>
  );
};

export default VoiceSelector;
