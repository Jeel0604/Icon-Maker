import './App.css';
import IconBuilder from './IconBuilder';

export default function App() {
  return (
    <div className="app">
      <header className="page-header">
        <div className="header-inner">
          <span className="logo-chip">
            <span className="logo-dot" />
            FileIcons
          </span>
          <h1 className="page-title">Icon Builder</h1>
          <p className="page-sub">Customise your file icon — then download the SVG</p>
        </div>
      </header>

      <IconBuilder />

      <footer className="page-footer">
        <p>FileIcon system — Vite + React · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
