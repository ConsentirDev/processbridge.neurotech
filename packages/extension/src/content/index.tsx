import React from 'react';
import ReactDOM from 'react-dom/client';
import FloatingWidget from './FloatingWidget';
import './content.css';

// Create a container for the React widget
const createWidgetContainer = () => {
  const container = document.createElement('div');
  container.id = 'processbridge-widget-root';
  document.body.appendChild(container);
  return container;
};

// Initialize the widget
const initWidget = () => {
  const container = createWidgetContainer();
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <FloatingWidget />
    </React.StrictMode>
  );
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWidget);
} else {
  initWidget();
}

// Listen for text selection
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  if (selectedText && selectedText.length > 10) {
    // Dispatch custom event with selected text
    const event = new CustomEvent('processbridge:textSelected', {
      detail: {
        text: selectedText,
        range: selection?.getRangeAt(0),
      },
    });
    document.dispatchEvent(event);
  }
});
