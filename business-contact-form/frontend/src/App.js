import React from 'react';
import './App.css';
import ContactForm from './components/ContactForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Please fill out the form below.</p>
      </header>
      <main>
        <ContactForm />
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} Thunk-it.com. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;