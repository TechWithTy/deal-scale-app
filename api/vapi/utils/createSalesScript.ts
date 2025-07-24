function createAssistantMessages(salesScript: string): Message[] {
  const scriptLines = salesScript
    .split('\n')
    .filter((line) => line.trim() !== '');

  const messages: Message[] = [
    {
      role: 'system',
      content: `You're a sales agent following this script:
  ${scriptLines.join('\n')}
  Follow this script while adapting to the conversation naturally.`
    }
  ];

  // Add script lines as assistant messages
  scriptLines.forEach((line, index) => {
    messages.push({
      role: 'assistant',
      content: line,
      type: index === 0 ? 'request-start' : undefined
    });
  });

  return messages;
}
