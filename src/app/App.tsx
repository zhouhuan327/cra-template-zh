import React, { useState, useEffect } from "react";
import styled from "styled-components";
const P = styled.p`
  color: red;
  display: inline-block;
`;
function App() {
  const [n] = useState<number>(0);
  useEffect(() => {
    console.log(n);
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <P>
          Edit <code>src/App.tsx</code> and save to reload.
        </P>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
