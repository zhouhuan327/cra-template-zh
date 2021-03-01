import styled from "styled-components";
// lint sc component test
const P = styled.p`
  display: inline-block;
  color: red;

  .insert {
    display: block;
  }

  .alter:after {
    display: block;
    background-color: red;
    color: red;
    content: "example";
  }

  .delete {
    display: block;
  }
`;
export default P;
