import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #ff2d55;
    --primary-dark: #e01a43;
    --bg-dark: #0a0a0a;
    --bg-dark-light: #1c1c1c;
    --text-dark: #F5F5F5;
    --border-dark: #2c2c2c;
    
    /* Cores de Status */
    --green: #10B981;
    --orange: #f59e0b;
    --blue: #3b82f6;
    --purple: #8b5cf6;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Poppins', sans-serif;
    background-color: var(--bg-dark);
    color: var(--text-dark);
    -webkit-font-smoothing: antialiased;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: var(--bg-dark); }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #555; }
`;

export default GlobalStyles;