import React from "react";
import styled from "styled-components";
import { Layout } from "antd";
const P = styled.p`
  display: inline-block;
`;
const { Header, Footer, Content } = Layout;
function App() {
  return (
    <Layout>
      <Header>
        <P>Header</P>
      </Header>
      <Content>Content</Content>
      <Footer>Footer</Footer>
    </Layout>
  );
}

export default App;
