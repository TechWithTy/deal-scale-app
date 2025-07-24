import { useKanbanStore } from '@/lib/stores/user/login';

export default function QuoteSection() {
  const { quotes, currentQuoteIndex } = useKanbanStore();

  return (
    <div className="relative z-20 mt-auto">
      <blockquote className="space-y-2">
        <p className="text-lg">
          &ldquo;{quotes[currentQuoteIndex].text}&rdquo;
        </p>
        <footer className="text-sm">{quotes[currentQuoteIndex].author}</footer>
      </blockquote>
    </div>
  );
}
